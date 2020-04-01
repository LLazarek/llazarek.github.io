    Title: Reference management with Org mode
    Date: 2020-04-01T14:03:58
    Tags: emacs, org, research

I manage all of my references using (guess) Org mode. This is a brief summary of what I do and why it works for me.

<!-- more -->

<br></br><br></br>

# Reference management expectations

There are a few things that I expect from a system to manage research references.

1.  Keep track of papers that I have read, and papers that I should read.
2.  Record essential information for each, like
    1.  A copy of the paper (pdf).
    2.  The paper's citation information (e.g. bibtex).
    3.  My own notes on the paper.
3.  Organize the information so that I can find it later.
4.  Link different papers and notes together.
5.  Have papers and notes be individually referable from outside the system.
    1.  So that I can point to specific papers and notes from any of my other notes, even outside of the reference management system.

Org mode neatly handles all of these points. I'll go through how I handle each point above, one at a time.

<br></br><br></br>

# Keeping track of papers

I store my papers and notes in a directory that looks like this:

    reading
      |-> reading-list.org
      |-> refs.bib
      |-- papers
      |     |-> a-paper.pdf
      |     ...
      `-- notes
            |-> a-paper.org
            ...

The first file (`reading-list.org`) is a master org file that records all of the papers I have ever read or plan to read.
At its simplest, the file looks like this.

    # reading-list.org
    #+TITLE: Reading list
    
    * Read
    ** An Interesting Paper - Owens+
    [[file:papers/a-paper.pdf][a-paper.pdf]]
    [[file:notes/a-paper.org][notes]]
    
    ...
    
    * To read
    ** Contracts for First-Class Modules - Strickland+
    [[file:papers/dls09-sf.pdf][dls09-sf.pdf]]
    
    ...

It has two main sections: read papers, and papers to read.
Each section has one entry per paper.
Whenever I learn of a paper that I think I should read, it goes into `To read` along with a link to a place where I can find the paper (either online, or already downloaded into the `papers` directory).
When I finish reading it, I move the entry to the `Read` list (see [org-refile](https://orgmode.org/manual/Refile-and-Copy.html)).

The format for paper entries that I like to use is to have each heading be the title of the paper and the first author's last name.
I don't include the other authors because then the headings tend to get long, and that information is kept elsewhere already.

Thus, this master file provides a centralized location to track all of the papers that I have read or need to read.

<br></br><br></br>

# Recording essential information

The master file has more than just a list of paper references, however. It also [links](https://orgmode.org/manual/Hyperlinks.html) each reference to its essential information.
The body of every paper entry has links to the paper pdf and the notes, if I have already read it.

When I get around to reading the paper, I create a notes file with the same name as the paper pdf (that's not really important, it's just my convention) in the `notes` directory, and link to it in the paper's entry in the master list.

The notes file looks like this.

    # a-paper.org
    #+TITLE: An Interesting Paper
    #+AUTHOR: Sacha Owens, Bill Jones
    
    [[file:../papers/a-paper.pdf][Paper]]
    
    * Reference
    [[file:../refs.bib::owens-pldi-1988][Owens & Jones 1988: Interesting Paper]]
    
    * Notes
    Some notes...

It has the title of the paper, its full author list, a link to the paper, a link to its bibtex citation (which I put in the `refs.bib` file), and finally the actual notes.

Hence, with this notes file we collect the three bits of essential information for every paper: the pdf, its citation information, and my notes on it.

<br></br><br></br>

# Organizing information so I can find it later

## Search everything

All of this information is stored in plain text, so unstructured information retrieval is easy with [full text fuzzy searching](https://llazarek.com/2019/01/fuzzy-searching-notes-with-fzf.html).
This is how I typically find papers and notes on them, because I can just start searching with whatever came to mind and `fzf` finds it almost instantly.

## Tagging

Sometimes I need something a little more structured, though.
For instance, searching for all the papers I have read related to some topic.
For these kinds of searches, I use [tags](https://orgmode.org/manual/Tags.html) on every paper in the master reading list.
I augment the basic reading list I showed before to look like this.

    # reading-list.org
    #+TITLE: Reading list
    * Tag meanings
    | Tag     | Meaning               |
    |---------+-----------------------|
    | fake    | a fake paper          |
    | racket  |                       |
    | pl      | programming languages |
    | se      | software engineering  |
    | compile | compilers             |
    | ctc     | contracts             |
    ...
    
    * Read
    ** An Interesting Paper - Owens+                                      :fake:
    [[file:papers/a-paper.pdf][a-paper.pdf]]
    [[file:notes/a-paper.org][notes]]
    
    ...
    
    * To read
    ** Contracts for First-Class Modules - Strickland+           :pl:racket:ctc:
    [[file:papers/dls09-sf.pdf][dls09-sf.pdf]]
    
    ...

I add a section recording all of the tags that I'm using along with an explanation.
Then, I add tags to every paper entry (see [setting tags](https://orgmode.org/manual/Setting-Tags.html#Setting-Tags)) for the topics it touches upon.

Once everything is tagged, org can generate [sparse trees](https://orgmode.org/manual/Sparse-Trees.html) to show all papers with a given tag(s), or the [agenda](https://orgmode.org/manual/Agenda-Views.html) can be used to filter with more complex patterns (like [arbitrary boolean tag formulas &#x2013; see the "Filtering" section](https://llazarek.com/2018/07/improving-the-agenda.html)).

<br></br><br></br>

# Linking papers and notes together (and referring to them from elsewhere)

At this point, this has already been demonstrated: I use [org's builtin links](https://orgmode.org/manual/Hyperlinks.html) extensively to link the different parts of the system together.

-   The paper entries in the master reading list link to the paper and its notes.
-   The paper notes link to the paper, its citation, and can include arbitrary links to other papers and notes.
-   The notes can themselves be linked to from any other org notes that I have.

For example, the notes for "An Interesting Paper" might include a link like this.

    # a-paper.org
    #+TITLE: An Interesting Paper
    ...
    * Notes
    Some notes...
    This paper is quite related to [[file:another-interesting-paper.org][Johnson's POPL 1998 paper]].
    ...

<br></br><br></br>

# An aside: organizing everything else

This post is part of a series of posts describing how I use org mode.
If you enjoyed it, check out the other ones:

-   [Organization with Org Mode](https://llazarek.com/2018/07/organization-with-org-mode.html)
-   [Improving the Agenda](https://llazarek.com/2018/07/improving-the-agenda.html)
-   [Improving the Agenda, part 2](https://llazarek.com/2018/09/improving-the-agenda-part-2-custom-views.html)
-   [Images in org notes](https://llazarek.com/2018/10/images-in-org-mode.html)
