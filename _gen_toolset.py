#!/usr/bin/env python3
import os

with open(r"D:\claude_projects\web_tool\Histogram.html", "r", encoding="utf-8") as f:
    hist = f.read()

with open(r"D:\claude_projects\web_tool\JsonTable.html", "r", encoding="utf-8") as f:
    jstab = f.read()

hist_style_start = hist.find("<style>") + len("<style>")
hist_style_end = hist.find("</style>")
hist_css = hist[hist_style_start:hist_style_end]

jstab_style_start = jstab.find("<style>") + len("<style>")
jstab_style_end = jstab.find("</style>")
jstab_css = jstab[jstab_style_start:jstab_style_end]

print(f"Histogram CSS length: {len(hist_css)}")
print(f"JsonTable CSS length: {len(jstab_css)}")

hist_css_modified = hist_css.replace("max-width:1200px;", "max-width:1400px;")
hist_css_modified = hist_css_modified.replace("@media(min-width:768px)", "@media(min-width:900px)")
hist_css_modified = hist_css_modified.replace(".panel-input{width:360px;flex-shrink:0;}", ".panel-input{width:340px;flex-shrink:0;}")
hist_css_modified = hist_css_modified.replace(".panel-chart{flex:1;min-width:0;}", ".panel-chart{flex:1;min-width:0;}
    .panel-table{flex:1;min-width:0;}")

NL = chr(10)
