    Title: Non-linear notes with Org
    Date: 2019-07-24T16:48:06
    Tags: emacs, org

For all that I rave about org mode, I generally prefer taking notes by hand.
Org wins out when my notes are certain kinds of technical or reference notes, including code snippets, links to resources, etc.
In those cases, embedded code blocks, inline images, links, and more make org mode a perfect medium.
Luckily, a large portion of the notes I take fall into those categories.
But for the kind of notes that I take while trying to understand something, or build a high level idea of a lecture or book, handwritten notes are far superior in my opinion.
This kind of note taking is also often more rewarding.

It would be great if org mode could handle these kinds of notes as well.
Why can't it?

<!-- more -->

First, the problem with handwritten notes.
They're physical, and physical things get lost.
The solution, I often think, is to scan them.
Now they can't be lost, but can they be found easily?
Not really, because they're not searchable.
OCR can't even help (even if it were reliable) because my handwriting is terrible.

Plain text notes are great because they solve both of those problems.
They're digital and quickly searchable with `grep` or [fzf](https://github.com/junegunn/fzf), so I can actually find those notes about Markov models that I vaguely remember from several years ago.
But text notes are too flat and linear to work well for typical note taking.
I find that it's slow and difficult to linearize ideas into coherent text while taking notes.
When I write notes by hand, I use a mixed style of sentences grouped in a vaguely mind map-like style, with links between groups relating concepts.
I also often freely use arrows to link smaller things like words or sentences within a group, or to annotate pieces of an idea or equation with further explanation.
For example, here's a snippet of some old notes exemplifying these features.
TODO: image of notes (on phone)

I would ideally like to be able to write notes like this in org mode, but this seems to be asking a lot (too much?).
It's entirely unclear to me how to reasonably write text that captures the simplicity, the ease of both writing and reading this kind of handwritten notes.
I can think of two wildly different approaches, neither of which is satisfying.

The first is to write something that can be used to generate an image like the handwritten version, which ends up being a kind of program.
Something like this:

    #lang notes
    
    *Tractability* := {worst case}_1 runtime is {_polynomial_}_2 in input size
    :1: Why? Analyses compose!
    :2: "Scales well": {T(c n)}_3 = {d T(n)}_4
    :3: Const increase in input size
    :4: Const increase in runtime
    :=>: 3 4
    
    {T(n) := wost case runtime for input {size}_6 n}_5
    :=>: 2 5
    
    :6: {bits}_7
    :7: Usually for "single" inputs like a number (e.g. fibonacci)
    :6: elements / components

This is nice because it's pretty unambiguous and aught to be able to render into something very similar to the handwritten version.
Otherwise, however, it's terrible. 
It has none of the instant understandability of the handwritten notes.
Supposing even that it could be rendered nicely, though, I think it's a tough sell to have such an opaque source syntax, and it easn't even particularly fast or easy to write.
One of the things that I love about org is that it has many features that make notes extremely readable in their source buffer (inline images, markup fontification, latex overlays, the list goes on&#x2026;);
I generally prefer reading my notes from source rather than exporting them.
So it's pretty important to me that I can read the source.
And don't even ask how annotation of formulas is supposed to work (it needs to get passed through to LaTeX).

Let's give it another go, focusing only on how the source looks.

                           why? analyses compose!
                          /
                         ,
    *Tractability* := worst case runtime is _polynomial_ in input size
                                            /   ⇓
     ,-------------------------------------'    ⇓
    .|   T(n) := worst case runtime for input size n.
    .|                                        / \
    .|                                       /   \
    .|                                    bits    elements, components
    .|                                    /
    .|        Usually for "single" inputs
    .|        like a number (e.g. fib)
     v        
    "Scales well"
    T(c n) = d T(n)
      /       \________________________
     ,                                 '
    Const increase in input size  ==>  Const increase in runtime

This is just about as bad, but for an almost entirely opposite set of reasons.
It's nice because it has much of the instant visual understandability of the original.
But actually writing anything like this (and fiddling the formatting) is a gargantuan pain.
The handwritten notes took less than a minute of actual writing, and that writing was done absentmindedly while focusing on a lecture and thinking about it.
The version above took more than five minutes of dedicated fiddling, even knowing beforehand the final desired format and all the content!
This is clearly unusable as well.

Maybe there's some magical sweet spot in between these two ideas that balances presentation with ease of writing.
Or maybe there's a way to achieve those two goals in plain text that's entirely different.
The more I think about this, however, the more I doubt that it's even possible to have a plain text representation that fits the bill.
Maybe I'm just asking too much?

For now, I've settled on scanning notes and writing little keyword summaries in an text file "index" that points to the scans.
It's a poor solution.
