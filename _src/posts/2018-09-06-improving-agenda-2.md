    Title: Improving the Agenda (part 2: custom views)
    Date: 2018-09-06T20:40:28
    Tags: emacs, org

This is the second post on configuring the agenda. Find the first post [here](https://llazarek.github.io/2018/07/improving-the-agenda.html).

<!-- more -->

<br></br><br></br>

# Context

## The default agenda is limited

While org mode's default agenda layout is informative and can certainly be used effectively with minor tweaks (I used it as such quite effectively for a few years), it's not perfect.
It can easily become cluttered and difficult to parse with too many tasks &#x2013; precisely the circumstance in which it *should* make it easy to tell what needs to be done.
Furthermore, since only time-stamped tasks show up in the default agenda, all the tasks I want to see must be dated.
For many types of tasks this makes sense, as they must be performed on or by a certain date;
however, a large class of tasks have no such clear date associated.
For example, many low-priority tasks can be done any time, and long-term/ongoing tasks like projects without a definite deadline don't make sense to assign to arbitrary dates.
These types make up a category of tasks about which I want to be reminded (or made aware of) in the agenda, without interfering with my ability to see and manage my more time-sensitive tasks.

## Representing ongoing tasks

In the default agenda, I would typically schedule such tasks on the first date at which I wanted to be reminded of the task, but this approach is generally unattractive.
It usually results in my agenda view for any given day consisting (often in large part) of a list of long-overdue tasks which aren't actually overdue, but are just ongoing, low prioty, or time-insensitive.
This meant that to read what I needed to do for the day I must first mentally identify and filter out that category of tasks in order to see the time-sensitive items that must be completed by today or in the near future.
This clearly means that agenda is *under-performing in it's most basic function* &#x2013; to make it easy, if not instantaneous, to see what needs to be done today.

While I found ways to mitigate this issue with prioritization and emphasis (as described in the last post), that solution was never really satisfactory because the overdue tasks still cluttered my view of today's tasks.

The ideal solution to this problem is to be able to partition the agenda into sections, showing first the time-sensitive tasks of the day, then the tasks I have marked as priority items, and finally a list of all ongoing/time-insensitive tasks.

<br></br><br></br>

# Custom agenda commands

Unsurprisingly, org mode provides pretty simple tools to make that dream a reality.
Custom agenda commands allow pretty arbitrary queries of tasks in the agenda files to be pieced together into [composite agenda views](https://orgmode.org/worg/org-tutorials/org-custom-agenda-commands.html).
In particular, [agenda blocks](https://orgmode.org/manual/Block-agenda.html#Block-agenda) allow the agenda to be partitioned into different sections featuring entirely independent queries.

<br></br><br></br>

# Example

The syntax for defining custom agenda commands is not entirely straightforward, so I think it is best conveyed by example.
The docs provide some information, and the [worg page](https://orgmode.org/worg/org-tutorials/org-custom-agenda-commands.html) is quite helpful.
In general, I found it easiest to tweak and extend examples to obtain the desired configuration.

## A multi-part agenda view

To create a partitioned agenda view, modify `org-agenda-custom-commands` like this.
The agenda views will be available from the agenda dispatcher, `org-agenda`.

    (setq org-agenda-custom-commands
          '(("h" "Agenda and Home-related tasks"
             (;; One block with a standard agenda view
              (agenda "")
              ;; one block of ALL tasks tagged :home:
              (tags-todo "home")))
            ...))

## Filtering

Each block can have specialized filters for the items that should be included in the block.

For example, with the above custom command any scheduled/deadline tasks tagged with `:home:` will be displayed twice.
To fix this, we can filter out scheduled/deadline tasks from the second block:

    (setq org-agenda-custom-commands
          '(("h" "Agenda and Home-related tasks"
             (;; One block with a standard agenda view
              (agenda "")
              ;; one block of ALL tasks tagged :home:
              (tags-todo "home"
                         (org-agenda-skip-function
                          '(org-agenda-skip-if nil '(scheduled deadline))))))
            ("H" "Agenda and Home-related tasks**"
             (;; One block with a standard agenda view
              (agenda "")
              ;; one block of ALL tasks tagged :home:
              (tags-todo "home"
                         (org-agenda-skip-function
                          '(or (org-agenda-skip-if nil '(scheduled deadline))
                               (org-agenda-skip-if 'regexp ":work:"))))))
            ...))

The second custom view also shows how filters can be combined with `or` and `and` to create complex filters.
The second block of that view now also filters out any items tagged with `:work:`.

## A three-part agenda

The agenda configuration I now use consists of three sections in the following order:

1.  Scheduled, overdue, and upcoming deadline time-sensitive tasks for the current day:
    
        (agenda "plain"
                ((org-agenda-span 'day)))
2.  Prioritized tasks for the current period (any tasks with the priority tag)
    
        (tags-todo "my-priority-tag"
                   ((org-agenda-span 'day) 
                    (org-agenda-overriding-header
                     "Priority tasks")))
3.  All other tasks, sorted by priority tag &#x2013; specifically tasks *without* any timestamp
    
        (alltodo ""
                 ((org-agenda-skip-function
                   '(org-agenda-skip-if nil '(scheduled deadline)))
                  (org-agenda-overriding-header
                   "Low priority tasks")))
