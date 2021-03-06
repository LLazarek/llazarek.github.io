    Title: Modal Editing in Emacs
    Date: 2018-07-09T02:02:02
    Tags: emacs

Modal editing in emacs is easy, and can be much better than vim.

<!-- more -->

<br></br><br></br>

# Emacs and vim: modal editing

The holy war of text editors will never be resolved, because emacs and vim represent wholly different philosophies of what they want to be.
Vim wants to be a lightweight yet powerful text editor.
*Emacs doesn't even want to be a text editor*, and it isn't one.
Emacs is more aptly described as a text-based programming environment.
This is clear when one actually looks at how emacs works and emacs lisp: all editing commands are functions, just as well executed by pressing keys as by an elisp program.

What inevitably comes up in the debate about text editors, however, is not interesting differences like that.
One of the main things people argue about is modal editing.
Emacs' default text insertion strategy is not modal, while vim's is.
For many people, modal editing is so fast and effective that this alone makes vim better than emacs.

I actually agree, though not about vim being better ;).
Modal editing is, in my opinion, a much more effective way to work with text most of the time.
Given what I described above about emacs, however, it should be clear that this is hardly a real difference.
It's just a matter of writing the (little bit of) code for modal editing in emacs and binding the code to keys.
Or, for those who want things to be as close as possible to vim and/or are lazy, there's [EVIL mode](https://www.emacswiki.org/emacs/Evil).

But I have found writing my own modal editing system beneficial.
First of all, I don't think that *all* of the ways vim does things are great (or even good), though many of them are great.
So I want to be able to pick and choose the features I like, and mix in my own useful features.
By writing my own mode, I have the power to make the system exactly as I like it.

And it's not even very hard.

<br></br><br></br>

# Minor modes for modal editing

Emacs' [system of major and minor modes](https://www.gnu.org/software/emacs/manual/html_node/emacs/Modes.html) is quite expressive.
Namely, it makes it almost trivial to implement modal editing that works everywhere.
Both major and minor modes can create new keybindings.
Since major modes change depending on the type of text being worked on, but minor modes generally operate independently of that, a minor mode is the simplest route.

<br></br><br></br>

# What am I actually talking about?

Before describing how to implement modal editing as a minor mode, let's quickly review how modal editing works at an abstract level - so that it's clear why all the pieces are necessary and the roles they play.

Modal editing at its simplest means that text editing is done in two or more modes, each of which has presents a different interface for interacting with text.
The simplest way to think of this is probably similar to vim's two primary modes (though I'm going to simplify them a bit): "insertion" and "normal" modes, which I'll call "command" mode from here on.
In insertion mode, text can be typed, deleted (with backspace), etc, but the cursor can't be moved around and "extra" operations can't be done. Just typing text.
In command mode, the cursor can be moved and text manipulation operations like copy/pasta, search/replace, etc are available; furthermore, these commands can are executed using single key combinations, without any modifiers (ctrl, alt, etc).

This is a simplified version of how vim's modal editing works, and the system below will be a functionally similar approximation.
Instead of creating both modes, I approximate emacs's default mode as the equivalent of insert mode: actually, it's much better in my opinion because all of emacs' normal bindings to do manipulation are available, just without the single key shortcuts. 

<br></br><br></br>

# Creating a custom editing minor mode

As I just mentioned, I don't actually create a special insert mode; I just use emacs's normal bindings.
That means all there is to make is the command mode, which provides the single-key shortcuts characteristic of vim.

Every mode in the modal editing system should have a corresponding minor mode - except the normal insertion mode.
So one minor mode is necessary to create the command mode.
The way it works is simple; when the minor mode is active, we are in command mode, otherwise we aren't.
So the way to enter and exit is simply to activate/deactivate the minor mode.
Since a minor mode has its own keybindings, the shortcuts will just be keybindings in the minor mode.

Thankfully, creating a new minor mode is easy with [define-minor-mode](https://www.gnu.org/software/emacs/manual/html_node/elisp/Defining-Minor-Modes.html).
All that's necessary is a name, docstring, lighter symbol (for indicating on the modeline when the mode is active), and a keymap for bindings.

    (define-minor-mode some-mode-name
      "Docstring"
      ;; initial value
      nil
      ;; indicator for mode line
      " modeline-indicator"
      ;; minor mode bindings
      '(((kbd "key string as shown by C-h k") . some-interactive-function)
        ...)
      :group 'some-not-really-important-symbol)

Since this mode will be frequently enabled and disabled in the course of editing, the first command necessary is a toggle function.
This is really simple, because `define-minor-mode` automatically creates a variable with the same name as the mode which is not `nil` when the mode is active and `nil` otherwise.
Then just bind the keys to enter and exit the command mode, respectively with `global-set-key` and by placing the binding in the mode's keymap.
Picking a good binding to enter the command mode may be difficult (`ESC` is annoying to rebind because emacs interprets it as an alternative `ALT` key), so choose wisely; I use `M-SPC` and quite like it.
Here is a MWE providing vim-like hjkl movement.
Press `M-SPC` to enter the mode, and `i` to exit.

    (define-minor-mode my-command-mode
      "my-command-mode is a minor mode for modal editing.
    
    Use `toggle-my-command-mode' to enter and exit the mode.
    
    my-command-mode defines the following bindings:
    \\{my-command-mode-map}
    "
      ;; initial value
      nil
      ;; indicator for mode line
      " mcm"
      ;; minor mode bindings
      '(((kbd "i") . toggle-my-command-mode)
    
        ((kbd "j") . next-line)
        ((kbd "k") . previous-line)
        ((kbd "h") . backward-char)
        ((kbd "l") . forward-char))
      :group 'mcm-group)
    
    (defun toggle-my-command-mode (&optional set-state)
      "Toggle `my-command-mode', optionally ensuring its state with `SET-STATE'.
    
    `SET-STATE' is interpreted as follows:
      nil   (Same as no argument) Toggle `my-command-mode'
      -1    Ensure `my-command-mode' is disabled
      else  Ensure `my-command-mode' is enabled
    "
      (cond ((equal set-state -1)
             (when my-command-mode
               (my-command-mode -1)))
    
            ((equal set-state nil)
             (my-command-mode (if my-command-mode -1 1)))
    
            (else
             (unless my-command-mode
               (my-command-mode 1)))))
    
    (global-set-key (kbd "M-SPC") 'toggle-my-command-mode)

An aside for those unfamiliar with emacs lisp:
To try this out just copy-pasta it into any buffer (like `*scratch*`), highlight it, and execute (with `M-x`) `eval-region`.
Also, if you're particularly careful about your code, you may be wondering why it's ok that the minor mode definition binds `toggle-my-command-mode`, even though it isn't defined yet.
Actually, the code binding the function to the key just registers the <span class="underline">name</span> of a function and associates it with the key; when that key is pressed, the function associated with the name is looked up dynamically.
Thus, it's no problem to provide any arbitrary symbol (defined or not) to the binding code, you'll only run into issues if the symbol is still undefined when the key gets pressed.
In this case, the function is defined right away so that won't happen.

Ultimately, this pattern is how much of the functionality of the mode is implemented.
For many actions, however, there is likely a built-in command to do it, so use those instead.
For example, most basic movement commands are available built-in, like those shown above for moving the cursor bound to hjkl.

<br></br><br></br>

# Extra: context menus with hydra

The excellent [hydra package](https://github.com/abo-abo/hydra) provides a great way to create context menus for some of the more specialized commands that one might want bindings for, but may be difficult to memorize.
It's very easy to use; for example, here is a hydra that I use for register management.

    (defhydra mcm/hydra/registers (:color blue :hint nil)
        "
    Register commands
    _s_: Save point                 _n_: Number to register
    _j_: Jump to register         _i_/_+_: Increment number in register
    _y_: Copy to register           _h_: Show registers
    _p_: Insert from register       _w_: Window config to register
    "
        ("s" point-to-register)
        ("j" jump-to-register)
        ("y" copy-to-register)
        ("p" insert-register)
        ("h" helm-register)
        ("n" number-to-register)
        ("i" increment-register)
        ("+" increment-register)
        ("w" window-configuration-to-register)
        ("q" nil))
    ;; The function to activate this hydra is `mcm/hydra/registers/main'

<br></br><br></br>

# My own modal editing system

As an example of all of this in practice, [here is the system](https://gist.github.com/LLazarek/d9c226763860c3f53a6d28535e9efb64) for modal editing that I have used for the past few years.
I called it Nav-mode because initially I started it just for easier navigation; it has since evolved well beyond that, but I see little reason to change the name.

Note that it includes bindings for a number of custom commands and packages I haven't included, so it isn't quite plug and play, but the essence should be clear.
Some highlights of extra packages that I use in the mode include [helm](https://github.com/emacs-helm/helm), [avy](https://github.com/abo-abo/avy), [multiple-cursors](https://github.com/magnars/multiple-cursors.el), [smartparens](https://github.com/Fuco1/smartparens), [hydra](https://github.com/abo-abo/hydra).

<br></br><br></br>

# That's it!

Modal editing is not only possible in emacs, it's quite easy.
Furthermore, it's highly customizable, allowing me to tailor it precisely to my needs.
I have used this particular system of modal editing for a few years and I would unequivocally recommend it to anyone using emacs.
