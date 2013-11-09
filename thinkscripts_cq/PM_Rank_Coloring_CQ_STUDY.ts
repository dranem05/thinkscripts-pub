# =============================================================================
#Hint: <b>PM Rank Coloring CQ</b>\nExample script to color output for custom quotes. Copy and paste this into the Custom Quote thinkscript code area.
#
# PM Rank Coloring CQ
#
# @author: Patrick Menard, @dranem05, dranem05@alum.mit.edu
#
# Example script to color output for custom quotes. Copy and paste this into
# the Custom Quote thinkscript code area.
#
# LICENSE ---------------------------------------------------------------------
#
# This PM_Rank_Coloring_CQ script is free software distributed under the terms 
# of the MIT license reproduced here:
#
# The MIT License (MIT)
#
# Copyright (c) 2013 Patrick Menard, http://www.dranem05.com, http://dranem05.blogspot.com
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
# =============================================================================

#Wizard input: data
#Wizard input: length
#plot rank = PM_Rank_CQ_(data, length);
# TODO: 2013-11-09 wizard keywords don't yet work in user created scripts, only builtin scripts
# TODO: 2013-11-09 directly referencing user created scripts via the reference keyword don't yet work on TOS

plot rank = PM_Rank_CQ();
rank.AssignValueColor( if 70 <= rank               then Color.GREEN 
                  else if 50 <= rank and rank < 70 then Color.YELLOW
                  else if 10 <= rank and rank < 50 then Color.GRAY
                  else if                rank < 10 then Color.RED
                  else                                  Color.GRAY
                  );
