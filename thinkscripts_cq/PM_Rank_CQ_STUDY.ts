# =============================================================================
#Hint: <b>PM Rank CQ</b>\nCalculates the percentile rank over 252 trading days for desired fundamental data (IV, O, H, L, C, Volume, etc.). Distilled version intended for custom quote thinkscript. Copy and paste this into the Custom Quote thinkscript code area.
#
# PM Rank CQ
#
# @author: Patrick Menard, @dranem05, dranem05@alum.mit.edu
#
# Calculates the percentile rank over 252 trading days for desired fundamental
# data (IV, O, H, L, C, Volume, etc.). Distilled version intended for custom 
# quote thinkscript. Copy and paste this into the Custom Quote thinkscript code
# area. Note, this script colors the value based on  where it lays within the
# rank. Edit the input data source or the lookback period and rank coloring 
# thresholds to fit your needs.
#
# Once TOS enables user created scripts to utilize the Wizard keywords, this
# single script can be used in multiple custom quote or scan queries for 
# different desired fundamental data. As of 2013-11-09, the only workaround
# is to reference this script as a CONDITION in the Conditional Wizard tab
# and then augment the thinkscript in the thinkScript Editor tab to do 
# coloring, etc. 
#
# IMPORTANT: Once referenced, TOS essentially creates an exact copy of the
# referenced script and uses this copy. Thus any changes made to the original
# DOES NOT PROPAGATE to the custom script. You have to re-reference the script
# to propagate any changes that were made to the original.
#
# LICENSE ---------------------------------------------------------------------
#
# This PM_Rank_CQ script is free software distributed under the terms of the
# MIT license reproduced here:
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
#TODO: 2013-11-09 wizard keywords don't yet work in user created scripts, only builtin scripts

input data = close; #Hint data: change to desired fundamental data (IV, close, volume, etc.)
input length = 252; #Hint length: 252 ~= 12 mth | 189 ~= 9 mth | 126 ~= 6 mth | 63 ~= 3 mth
#def data_  = if !isNaN(data) then data else data_[1];
def pegHi = if !isNaN(data) then data else Double.POSITIVE_INFINITY; # saturate gaps hi
def pegLo = if !isNaN(data) then data else Double.NEGATIVE_INFINITY; # saturate gaps lo
def hi = highest(pegLo,length); 
def lo = lowest(pegHi,length);
plot perct = round((data - lo)*100 / (hi - lo),1); # fits column better at 1 sig.dig
#def perct = if isNaN(data) then perct[1] else round((data - lo)*100 / (hi - lo),1);
#plot rank = perct;

# Comment out the code below if only ever using this script as a reference in
# custom quotes since this will execute but not do anything as a reference.
perct.AssignValueColor( if 70 <= perct                then Color.GREEN 
                   else if 50 <= perct and perct < 70 then Color.YELLOW
                   else if 10 <= perct and perct < 50 then Color.GRAY
                   else if                 perct < 10 then Color.RED
                   else                                    Color.GRAY
                   );
