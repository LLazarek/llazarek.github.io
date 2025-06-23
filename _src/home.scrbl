#lang scribble/manual
@(require "citations.rkt"
          "structure.rkt")


@section{Lukas Lazarek}
@; Path must be a plain old path,
@; and will be munged by the build script to make it point to /img/
@; because for some reason Frog always puts it in /About/, which doesnt exist!
@(external-img "profile.jpg" #:alt "Me" #:style "width:300px")

I'm a postdoc at Brown university working with @hyperlink["https://nikos.vasilak.is/"]{Nikos Vasilakis} and the @hyperlink["https://atlas.cs.brown.edu/"]{ATLAS group}.
This page provides information about myself and what I have been doing recently.
The other half of the site is a blog that I use to practice writing about technical things, my research, and my interests.

@(linebreak)
@subsection{Research Interests}
My research is about empirically-driven Programming Languages approaches to understanding what and how language features are practically useful for regular people trying to build useful software.

People and their programs are imperfect, so one part of that work is in linguistic tools that support program robustness, monitoring, and debugging.
My dissertation work on contract systems and gradual typing centered around empirically evaluating how these specification tools, intended to improve robustness, may or may not assist with debugging through experimental data collection and analysis.
My ongoing work investigates how specification tooling for the Shell can provide practical robustness benefits in complex and imperfect existing systems.

Relatively few people are programmers, however, so another direction of my research is understanding how and why everyone else might find value in programming; my work in this direction explores languages, domains, and tools which enable non-experts to quickly make use of computing, while simultaneously providing a rich setting to learn about and apply powerful computing ideas to practical problems.


@(linebreak)
@subsection{Contact information}
My github profile is @hyperlink["https://github.com/llazarek"]{llazarek}.

I can be reached by email at
@verbatim|{
(or (concat "lukas" "_" "lazarek" "@" "brown.edu")
    (concat "lukas" "a" "lazarek" "@" "gmail.com"))
}|

@(linebreak)
@subsection{Publications}
@subsubsection{2025}
@(export-and-render-citation! koala-atc-25 "bib/koala-atc-25.html")
@(export-and-render-citation! static-hotos-25 "bib/hotos-static-25.html")

@subsubsection{2023}
@(export-and-render-citation! lgfd-icfp-23 "bib/lgfd-icfp-23.html")

@subsubsection{2022}
@(export-and-render-citation! gldf-programming-22 "bib/gldf-programming-22.html")

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
@item{@hyperlink["https://github.com/LLazarek/github-actions"]{github-actions} - library for using the github actions api
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
@(render-talk "How to Evaluate Blame for Gradual Types, Part 2"
              "ICFP 2023, Seattle"
              "2023-09-07"
              #f
              (hash "slides" "/doc/icfp-2023-talk.pdf"
                    ;; "video " ""
                    )
              "For the ICFP23 paper by the same name. (Recording video will be available soon.)")

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
