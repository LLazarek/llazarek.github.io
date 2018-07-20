    Title: Improving the Agenda
    Date: 2018-07-09T03:27:27
    Tags: emacs, org

Org mode's agenda is a fantastic interface for viewing and managing tasks.
However, its default display settings get cluttered with large numbers of tasks, making it difficult to see what really needs to be done.
Here are some of the ways I make the agenda crystal clear.

<!-- more -->

<br></br><br></br>

# Context

I have found org mode's agenda an invaluable tool for keeping myself organized over the years.
However, I can easily see how many newcomers to org fail to see its potential;
the default display settings for the agenda leave much to be desired.
Indeed, when I first started using the agenda to plan and manage my work, I often found myself staring at the agenda, overwhelmed by the sheer number of tasks and struggling to figure out what really needed to be done <span class="underline">now</span>.

A few appearance tweaks can make a world of difference, however.
The primary tools for doing this are simply color and text emphasis (bold, italics, underline).
The default settings don't really leverage colors and text emphasis to group and highlight tasks.
The second tool available is controlling the sorting of tasks with priorities.
Finally, the agenda provides rich filtering tools to make dealing with lots of disparate tasks a little easier.

<br></br><br></br>

# Grouping and emphasizing tasks with color

The most obvious way to help make more visual sense of the agenda is to color-code tasks.
While this functionality is not built-in, it's quite easy to add.
I think the most useful way to do this (thought not the easiest, see below) is by associating colors with tags, and colorizing tasks in the agenda according to their tags.
The following function does just that; it can be invoked in `org-finalize-agenda-hook`.
(Note that I can't claim full credit for this function, it is largely based on a stackoverflow answer I have since forgotten.)

    (defun ll/org/agenda/color-headers-with (tag col)
      "Color agenda lines matching TAG with color COL."
      (interactive)
      (goto-char (point-min))
      (while (re-search-forward tag nil t)
        (unless (find-in-line "\\[#[A-Z]\\]")
          (let ((todo-end (or (ll/org/agenda/find-todo-word-end)
                              (point-at-bol)))
                (tags-beginning (or (find-in-line " :" t)
                                    (point-at-eol))))
            (add-text-properties todo-end
                                 tags-beginning
                                 `(face (:foreground ,col)))))))
    
    ;; Helper definitions
    (setq ll/org/agenda-todo-words
          '("TODO" "GOAL" "NEXT" "STARTED" "WAITING" "REVIEW" "SUBMIT"
            "DONE" "DEFERRED" "CANCELLED"))
    (defun find-in-line (needle &optional beginning count)
      "Find the position of the start of NEEDLE in the current line.
      If BEGINNING is non-nil, find the beginning of NEEDLE in the current
      line. If COUNT is non-nil, find the COUNT'th occurrence from the left."
      (save-excursion
        (beginning-of-line)
        (let ((found (re-search-forward needle (point-at-eol) t count)))
          (if beginning
              (match-beginning 0)
            found))))
    (defun ll/org/agenda/find-todo-word-end ()
      (reduce (lambda (a b) (or a b))
              (mapcar #'find-in-line ll/org/agenda-todo-words)))

Example usage:

    (defun ll/org/colorize-headings ()
      ;; Color all headings with :pers: tan
      (ll/org/agenda/color-headers-with ":pers:" "tan")
      ;; and :work: blue
      (ll/org/agenda/color-headers-with ":work:" "blue"))
    (add-hook 'org-agenda-finalize-hook #'ll/org/colorize-headings)

Note that this function iterates over the agenda entries, modifying their face each time it is called.
So if an entry has a tag that is matched by more than one call to this function (e.g. it's tagged with `:pers:work:`), then <span class="underline">the task will have the color of the last call</span>.

Another way to do color coding (which takes precedence over the above method) is using priorities (about which I'll say more later).
Org has a built-in mechanism to colorize and emphasize tasks marked with [a priority](https://orgmode.org/manual/Priorities.html#Priorities) (`[#A]`, `[#B]`, etc).
Thus, it's straightforward to do.
In general though, I prefer the tag-based coloring for grouping/categorizing tasks.
This is the configuration I use, highlighting tasks with priority A in bolded magenta, B in light green, and C in orange.

    (customize-set-variable 'org-agenda-fontify-priorities t)
    (customize-set-variable 'org-priority-faces
                            (quote ((?A :foreground "magenta" :weight bold)
                                    (?B :foreground "green3")
                                    (?C :foreground "orange"))))

<br></br><br></br>

# Sorting

Another way to help identify important tasks more easily is using sorting.
As you might have guessed, priorities are not only useful for highlighting tasks;
they also affect the sorting of tasks in the agenda.
Higher priority tasks show up before lower priority ones within the same category (overdue, scheduled, deadline) in the agenda.
By default, tasks have a priority of B; I find this unintuitive, so I set the default priority to C.
This way tasks with priority A show first, then B, then C, then the rest.

    ;; Set default priority to C
    (customize-set-variable 'org-default-priority ?C)

You might ask "why not make the default priority be lower than C, so that tasks with any priority at all show up first?"
It turns out that the default priority has to be at least the lowest priority (`org-lowest-priority`), which by default is C.
Of course, it is possible to have as low a priority as you like (within reason), such as D, E, &#x2026;, Z.
I don't find that to be useful, however.
Two high-priority priorities are enough.

<br></br><br></br>

# Filtering

The agenda also provides filtering functions to restrict the displayed tasks.
They are pretty self-explanatory; in the agenda, hit "/" to filter by tag and "=" to filter by regular expression.
Press "/" again to clear or narrow further, or in the case of regexp filtering press "|" to clear the filter.

The only noteworthy point about filtering is that the tag filter cannot express disjunction.
This has caused me some grief, as I have wanted to filter with something like "work OR school".
The solution, though, is to just use the regexp filter with a pattern like ":\(work\|school\)".

<br></br><br></br>

# Showing more stuff

Having cleaned up the agenda and made it easier to read, it might become appealing to start showing more relevant details.
For example, seeing the notes in the body of a task is sometimes useful.
Alternatively, it might be useful to see the value of some [properties of the task](https://orgmode.org/manual/Properties-and-columns.html#Properties-and-columns).
Of course, the agenda can do it.

Showing context lines from the body of the task is as simple as pressing a key in the agenda;
"E" invokes `org-agenda-entry-text-mode` (see [the manual](https://orgmode.org/manual/Agenda-commands.html#Agenda-commands)), showing some lines from the body of the task.
To enable this behavior by default, configure `org-agenda-start-with-entry-text-mode`.
The number of lines can also be configured with `org-agenda-entry-text-maxlines`.
For example:

    ;; Show context lines by default in the agenda
    (customize-set-variable 'org-agenda-start-with-entry-text-mode t)
    ;; Show up to 4 lines of context
    (customize-set-variable 'org-agenda-entry-text-maxlines 4)

However, I find that the context provided by org creates too much clutter to be useful.
This is especially true when I have stuff written in the body of a task that I *don't* want to see in the agenda (often): `entry-text-mode` provides no way to configure *which* entries to show context for.
Thus, I prefer the alternative way to show more information, which is to show the values of specific properties when they are present in the task.

Showing property values in the agenda is provided by the excellent [org-agenda-property package](https://github.com/Malabarba/org-agenda-property), available on MELPA.
Here's the configuration that I use to show the value in three properties that I use to record why a task is blocked, deferred, or canceled, and to write short notes on the task.

    (use-package org-agenda-property
      :config
      (customize-set-variable 'org-agenda-property-list
                              '("WAITING?" "DEFERRED?" "CANCELLED?" "NOTE"))
      (customize-set-variable 'org-agenda-property-position 'same-line))
