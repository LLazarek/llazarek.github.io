    Title: Org Export Processing
    Date: 2018-11-03T20:33:06
    Tags: emacs, org

Org's [export system](https://orgmode.org/manual/Exporting.html) is a fantastic tool for writing various documents quickly and easily within org mode.
The only thing it lacks is simple tools for user-defined content generation during export.
It's pretty easy to implement, though.

<!-- more -->

I use org mode to write pretty much every document that I produce (papers, slideshows, reports, webpages; you name it).
One of the most useful elements of the export system to me &#x2013; besides the familiarity of using org all the time, of course &#x2013; is that it allows me to hook into the export process to easily define custom transformations.

I found myself doing this so often that I wrote a little package to make it easier to define the typical transformations inside my org documents.
It's really simple: it just adds a hook to `org-export-before-processing-hook` (which is run inside a temporary buffer with the file contents just before export processing begins).
That hook scans the file for lines beginning with `#+ll-org-process:` and eval's the elisp on those lines.
The package also provides two functions that I use most often in those lines: one to replace regexps in the document, and one to run inline code in the document to generate content.

Additionally, the package also removes trees tagged with `:noexport:` from the exported document, and removes the title text of headings tagged `:notitle:`.
I use these tags in exported documents almost constantly, so I have these transformations always-on.

<br></br><br></br>

# Example

One of the typical things I use this for is to add uniform structural content to exported documents.
For example, in some contexts I don't like the spacing between headings in exported HTML documents.
To fix that, I just add a regexp replacement to insert some whitespace before all headings of the appropriate level.

    #+ll-org-process: (ll/org-process/replace "^\\* " "<br></br><br></br>\n* ")

This approach provides a couple of advantages over, say, doing this replacement directly in the org source:

1.  The org document doesn't get cluttered by otherwise irrelevant formatting information
2.  There is a single point of control if I later decide to adjust the formatting rules
3.  I can't forget to add these formatting elements if I add more headings

In longer documents with repetitive structure, I have also used this to create a kind a domain-specific language tailored to the document I'm writing.
I last used this when writing an assignment involving lots of proofs, in which I wrote functions to format the proof elements and provide a single point of control for the appearance of many terms.
Indeed, using these tools allowed me to build up my proofs through a composition of formatting functions that felt very natural as a programmer, and made the document far more concise and less error prone than writing everything out manually.

<br></br><br></br>

# Code

The package is small enough that I'll just put the source here.
I put it in a file `ll-org-process.el` and `use-package` it from my init file.
Note that, of course, this evaluates arbitrary code in the buffers that you export.
That is its central feature.
I have chosen (what I think to be) reasonable identifiers to ensure that nothing unwanted or unexpected is evaluated, and I have never had any issues, but it is certainly something to be aware of.

    (defun ll/org-process/current-line-is-cmd ()
      (string-prefix-p "#+ll-org-process: "
                       (buffer-substring-no-properties (line-beginning-position)
                                                       (line-end-position))))
    
    (defun ll/org-process/replace (old new &optional fixedcase)
      "Replace all occurrences of regexp OLD with NEW. Supports
    replacement with matched groups using group references; see
    `replace-match' for more information.
    
    Note: Since regexps in Emacs undergo several levels of
    processing, if a regex needs to contain a '\\' as part of a
    regexp, then you need to have '\\\\'. For a literal '\\' in the
    regexp, you need '\\\\\\\\'. This goes for both OLD and NEW."
      (beginning-of-buffer)
      (while (re-search-forward old (buffer-end 1) t)
        (unless (ll/org-process/current-line-is-cmd)
          (replace-match new fixedcase))))
    
    (defun ll/org-process/eval-at-exps (&optional at-exp-delim)
      "Execute all at-expressions in the current buffer, replacing
    the expression with its result formatted as a string. An
    at-expression is any elisp expression beginning with the provided
    delimiter string (~@ by default). E.g. ~@(+ 1 2), ~@c-version
    "
      (let* ((delim (or at-exp-delim "~@"))
             (delim-len (length delim)))
        (save-excursion
          (beginning-of-buffer)
          (while (search-forward delim (buffer-end 1) t)
            (let ((invocation (read (current-buffer))))
              (backward-kill-sexp)
              (save-excursion
                (backward-char delim-len)
                (when (looking-at-p delim)
                  (delete-char delim-len)))
              (insert (format "%s"
                              (eval invocation))))))))
    
    (defun ll/org-process/preprocess-buffer (backend)
      "Execute all \"#+ll-org-process: \" lines in the current buffer.
    Process commands may be arbitrary elisp expressions. For
    convenience, the following special functions provide
    commonly-used behavior (which see):
    - `ll/org-process/replace'
    - `ll/org-process/eval-at-exps'
    "
      (save-excursion
        (beginning-of-buffer)
        (while (search-forward "#+ll-org-process: " (buffer-end 1) t)
          (when (current-line-is-cmd)
            (save-excursion
              (eval-region (point) (line-end-position)))
            (kill-whole-line)))))
    
    (add-hook 'org-export-before-processing-hook #'ll/org-process/preprocess-buffer)
    
    
    (defun ll/org-process/remove-headlines (backend)
      "Remove headings with the :noexport: tag, and delete the titles
    of headings with the :notitle: tag."
      (org-map-entries (lambda () (let ((beg (point)))
                                    (outline-next-visible-heading 1)
                                    (backward-char)
                                    (delete-region beg (point))))
                       "noexport" tree)
      (org-map-entries (lambda () (delete-region (point-at-bol) (point-at-eol)))
                       "notitle"))
    
    (add-hook 'org-export-before-processing-hook #'ll/org-process/remove-headlines)
    
    (provide 'll-org-process)
