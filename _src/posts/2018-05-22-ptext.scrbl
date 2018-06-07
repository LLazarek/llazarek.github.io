#lang scribble/manual

Title: Language-oriented Programming: ptext
Date: 2018-05-22T19:06:27
Tags: PL,racket

Language-oriented programming in action with racket.

<!-- more -->

@margin-note{
@bold{Note}
I recently learned about @hyperlink["https://docs.racket-lang.org/scribble/index.html"]{scribble}, and specifically @hyperlink["https://docs.racket-lang.org/scribble-pp/index.html"]{how scribble as a text preprocessor}.
It is far superior to ptext in terms of being actually useful.
}

A year or two ago, I wrote a text preprocessor to allow embedded text
generation using @hyperlink["https://racket-lang.org/"]{racket}.
The idea was to be able to embed racket expressions inside a text file
to manipulate its contents and generate a new file.
At its simplest, the tool would just extract the the racket
expressions, evaluate them, and insert the results back into the file.
I came up with the idea because I had a problem with
@hyperlink["https://www.ledger-cli.org/"]{ledger} that such a tool would
neatly solve, while possibly being useful for many other similar
things.

I used racket mostly because I had just started learning it, and I
didn't really leverage any of its most interesting features.
In fact, I spent most of my time figuring out how to circumvent some
of racket's design decisions (like the module system and constrained
@code{eval}).
I ended up with a few hundred lines of complicated code to do
something that, at least conceptually, is pretty simple.
Nontheless, I learned a good deal and eventually ended up with a
useful tool that I used right away to solve a real problem. I was
pretty happy with it, despite its many wrinkles.


Now, working my way through
@hyperlink["https://beautifulracket.com/"]{Beautiful Racket} I saw
how thinking about this same exact problem in terms of a
Domain-Specific Language can greatly simplify it.
The basic idea is that instead of writing a program to take the text
as input, interpret commands, and produce a new file as output, we can
simplify the problem by thinking of the text itself as a program to be
evaluated.
The plain text can be thought of as commands to insert themselves into
the output, and the embedded code as commands to insert other things.
Naturally, I immediately reworked the preprocessor to use this
approach and after a little bit of fiddling got
@hyperlink["https://github.com/LLazarek/ptext"]{ptext}.
This approach let me build (almost) the same tool in a fraction of the
code, and without most of the knots in the previous design.

It works by using a parser generator to generate a parser that
distinguishes racket expressions from regular text (using some
delimiters), and then converts each of those categories into
expressions to be evaluated and printed by racket.
The normal text just ends up becoming strings and the expressions get
wrapped in a print, so when racket runs the resulting program the
original text is printed and the expressions are evaluated and then
printed.
It's beautifully simple.

I won't go into further detail but do check out
@hyperlink["https://beautifulracket.com/"]{Beautiful Racket} if you
are interested.
It's really fantastic.
This exercise in applying language-oriented programming to one of my
own tools has served to clearly show me how this approach can be
useful.
I'm excited to see where else I might be able to use these ideas.



