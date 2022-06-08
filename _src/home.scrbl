#lang scribble/manual
@(require "citations.rkt"
          "structure.rkt")


@section{Lukas Lazarek}
@; Path must be a plain old path,
@; and will be munged by the build script to make it point to /img/
@; because for some reason Frog always puts it in /About/, which doesnt exist!
@(external-img "profile.jpg" #:alt "Me" #:style "width:300px")

I'm a grad student studying Programming Languages at Northwestern.
This page provides information about myself and what I have been doing recently.
The other half of the site is a blog that I use to practice writing about technical things, my research, and my interests.

@(linebreak)
@subsection{Research Interests}
I'm interested in Programming Languages approaches to make programming accessible and practically useful for human beings.

People and their programs are imperfect, so one part of that interest is in linguistic tools that support program robustness and debugging;
my ongoing work on contract systems and gradual typing centers around evaluating how these specification tools, intended to improve robustness, may or may not assist with debugging.

Relatively few people are programmers, however, so another part of my interest is understanding how and why everyone else might find value in programming;
my current work in this direction explores languages, domains, and settings which enable novices to use computing as a useful tool, while simultaneously providing a rich setting for digging deeper into foundational computing concepts.

I work on and use the @hyperlink["https://racket-lang.org/"]{Racket} programming language as a concrete setting for most of my research.

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
@subsubsection{2021}
@(export-and-render-citation! lgfd-icfp-21 "bib/lgfd-icfp-21.html")

@subsubsection{2020}
@(export-and-render-citation! lksfd-popl-20 "bib/lksfd-popl-20.html")

@subsubsection{2018}
@(export-and-render-citation! wmlk-oopsla-18 "bib/wmlk-oopsla-18.html")

@(linebreak)
@subsection{Software}
@itemlist[#:style #f
@item{@hyperlink["https://github.com/LLazarek/complot"]{complot} - language for compositional data visualization design
}
@item{@hyperlink["https://github.com/LLazarek/configurable"]{configurable} - library for simple software configuration via config files
}
@item{@hyperlink["https://github.com/LLazarek/process-queue"]{process-queue} - library for managing many parallel processes
}
@item{@hyperlink["https://github.com/LLazarek/mutate"]{mutate} - mutation system for s-expression languages
}
@item{@hyperlink["https://github.com/LLazarek/rscript"]{rscript} - language for scripts, mainly featuring an embedded declarative command-line argument description language
}
@item{@hyperlink["https://github.com/LLazarek/github-actions"]{github-actions} - library for managing github actions
}
@item{@hyperlink["https://github.com/LLazarek/ruinit"]{ruinit} - unit testing library
}
@item{@hyperlink["https://github.com/LLazarek/webgrep"]{webgrep} - CLI tool to search webpages recursively (descending into linked pages)
}
@item{@hyperlink["https://github.com/LLazarek/asciigraph"]{asciigraph} - CLI tool that makes ASCII plots
}
]

@(linebreak)
@subsection{Talks}
@(render-talk "How to Evaluate Blame for Gradual Types"
              "virtual"
              "2021-08-24"
              #f
              (hash "video" "https://www.youtube.com/watch?v=_S7BYbYb6Yk&list=PLyrlk8Xaylp5ed_Yhg2oTdVhrtVohVaoa&index=35")
              "For the ICFP21 paper by the same name.")

@(render-talk "Does Blame Shifting Work?"
              "POPL 2020, New Orleans"
              "2020-01-22"
              #f
              (hash "slides" "/doc/popl-2020-blame-shifting-talk.pdf"
                    "video" "https://youtu.be/EROZQwa-RuM")
              "For the POPL20 paper by the same name.")

@(linebreak)
@subsection{Posters and Extended Abstracts}
@(render-talk @elem{How to Efficiently Process 2@superscript{100} List Variations}
              "SPLASH 2017, Vancouver"
              "2017-10-22"
              #f
              (hash "abstract" "/doc/splash17_final.pdf"
                    "poster" "/doc/poster_splash_2017.pdf")
              "Extended abstract and poster, won first place in student research competition.")
