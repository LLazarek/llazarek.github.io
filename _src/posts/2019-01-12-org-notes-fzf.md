    Title: Fuzzy-searching notes with fzf
    Date: 2019-01-12T17:39:54
    Tags: emacs, org

I have a lot of plain text notes, from years of using org mode for nearly everything.
Finding specific pieces of information in that sea of information can be difficult; I am unwilling and unable to remember where exactly I wrote something down.
Of course, since it's all plain text, grep/ag and friends seem ideally suited to the task &#x2013; except that requires remembering exactly how the information was worded.
Also too much.
What about fuzzy search?

<!-- more -->

The ideal solution would be full-text fuzzy search that recursively examines all files in a directory, following symlinks.
Then I can symlink every place I put my notes to one location, and point it there.

With emacs, as ever, there was a solution but a quick google search away: [Deft](https://jblevins.org/projects/deft/).
Deft provides a nice interface to incrementally (though not fuzzily) search a whole repository of text.
I used it for a while, but as my notes grew more numerous and I less patient, its speed became a rather glaring annoyance.
It got to the point where I manually guessed the location of notes rather than suffering its half-minute load time.

Yesterday a friend recommended [fzf](https://github.com/junegunn/fzf) to me and within a few minutes I was wondering why I had wasted so much time before this.
Along with [fzf.el](https://github.com/bling/fzf.el) and a touch of elisp, I had a responsive, full-text fuzzy search that just works.

    (use-package fzf
      :bind ("C-S-s" . ll/fzf/notes)
    
      :config
      (customize-set-variable 'fzf/args
                              "-x --color bw --print-query --delimiter=: --nth=3")
      (customize-set-variable 'fzf/executable
                              "/path/to/fzf")
      (defvar ll/fzf/notes-directory "/path/to/notes/directory")
      (defun ll/fzf/notes ()
        (interactive)
        (fzf/start ll/fzf/notes-directory
                   "ag -f --nobreak --noheading .")))
