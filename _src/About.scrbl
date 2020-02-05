#lang scribble/manual
@(require "citations.rkt"
          "structure.rkt")


@section{Lukas Lazarek}
@; Path must be a plain old path,
@; and will be munged by the build script to make it point to /img/
@; because for some reason Frog always puts it in /About/, which doesnt exist!
@(external-img "profile.jpg" #:alt "Me" #:style "width:300px")

Hi! I'm a grad student studying Programming Languages at Northwestern.
This page provides information about myself and what I have been doing recently.
The other half of the site is a blog that I use to practice writing about technical things, my research, and my interests.

@(linebreak)


@subsection{Research Interests}
Broadly, I'm interested in Programming Languages approaches to improving software development.
This concretely means investigating how language features can improve program robustness, understandability, and maintainability.
My work involves understanding the fundamental meanings of those features, how they interact, and how they impact programmers.
To those ends, I use reduction semantics as a primary tool for modeling and understanding various languages and their features.
Additionally, I work on the @hyperlink["https://racket-lang.org/"]{Racket} programming language as a test bed for implementing, using, and evaluating new features or languages.

@(linebreak)


@subsection{Contact information}
My github profile is @hyperlink["https://github.com/llazarek"]{llazarek}.

I can be reached by email at
@verbatim|{
(or (concat "lukas" "." "lazarek" "@" "eecs.northwestern.edu")
    (concat "lukas" "a" "lazarek" "@" "gmail.com"))
}|

@(linebreak)


@subsection{Publications}
@subsubsection{2020}
@(export-and-render-citation! lksfd-popl-20 "bib/lksfd-popl-20.html")


@subsubsection{2018}
@(export-and-render-citation! wmlk-oopsla-18 "bib/wmlk-oopsla-18.html")

@(linebreak)


@subsection{Talks}
@(render-talk "Does Blame Shifting Work?"
              "POPL 2020, New Orleans"
              "2020-01-22"
              #f
              (hash "slides" "/docs/popl-2020-blame-shifting-talk.pdf"
                    "video" "?")
              "For the POPL20 paper by the same name.")

@(linebreak)


@subsection{Posters and Extended Abstracts}
@(render-talk @elem{How to Efficiently Process 2@superscript{100} List Variations}
              "SPLASH 2017, Vancouver"
              "2017-10-22"
              #f
              (hash "abstract" "/docs/splash17_final.pdf"
                    "poster" "/docs/poster_splash_2017.pdf")
              "Extended abstract and poster, won first place in student research competition.")
