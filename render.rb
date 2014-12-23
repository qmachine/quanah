#-  Ruby source code

#-  render.rb ~~
#                                                       ~~ (c) SRW, 18 Aug 2012
#                                                   ~~ last updated 23 Dec 2014

require 'date'
require 'github/markdown'

filename = 'index.html'

today = '%02d %s %4d' % [
    Time.now.day,
    Date::ABBR_MONTHNAMES[Time.now.month],
    Time.now.year
]

File::open(filename, 'w') do |f|
    content = <<-EOF
<!DOCTYPE html>
<!--
    #{filename} ~~
                                                        ~~ (c) SRW, #{today}
-->
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="author" content="Sean Wilkinson"/>
    <title>Project Description: Quanah</title>
    <link rel="stylesheet" href="../print.css" media="print"/>
    <link rel="stylesheet" href="../screen.css" media="screen"/>
    <link rel="shortcut icon" href="./favicon.ico"/>
  </head>
  <body>
    <noscript>This page requires JavaScript.</noscript>
    <a id="github_ribbon" href="https://github.com/qmachine/quanah">
      <span>Fork me on GitHub!</span>
    </a>
    #{GitHub::Markdown.render_gfm(IO.read('README.md')).gsub!('<br>', '')}
    <p>
      Note that this page has already loaded Quanah, which means that you can
      open your browser's developer console and experiment without even leaving
      this page :-)
    </p>
    <script defer src="//quanah.googlecode.com/git/src/quanah.js"></script>
  </body>
</html>
EOF
f.write(content.chomp)
end

#-  vim:set syntax=ruby:
