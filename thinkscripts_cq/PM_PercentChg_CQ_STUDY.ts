# =============================================================================
#Hint: <b>PM Percent Change CQ</b>\nCalculates the percent change in value from now and N days ago and colors the result based on user designated hi and lo alert thresholds. Distilled version intended for custom quote thinkscript. Copy an paste this into the Custom Quote thinkscript code area.
#
# PM Percent Change CQ
#
# @author: Patrick Menard, @dranem05, dranem05@alum.mit.edu
#
# Calculates the percent change in value from now and N days ago and colors the
# result based on user designated hi and lo alert thresholds. Distilled version
# intended for custom quote thinkscript. Copy an paste this into the Custom
# Quote thinkscript code area. Edit the data type, lookback period, and alert
# thresholds to fit your needs.
#
# LICENSE ---------------------------------------------------------------------
#
# This PM_PercentChg_CQ script is free software distributed under the terms of
# the MIT license reproduced here:
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
#Wizard input: hi_alert
#Wizard input: lo_alert
#Wizard input: rounding
#TODO: 2013-12-13 wizard keywords don't yet work in user created scripts, only builtin scripts

#TODO: 2013-12-13 Adjust high and low alert for each stock as a function of SPY

input data     = close; #Hint data_type: Data on which to compute a % chg
input length   = 10; #Hint length: 252 ~= 12 mth<br>189 ~= 9 mth<br>126 ~= 6 mth<br>63 ~= 3 mth
input hi_alert =  5.0; #Hint high_alert: Percent equal to or above which to change % chg display color
input lo_alert = -5.0; #Hint low_alert: Percent equal to or below which to change % chg display color
input rounding = 1; #Hint rounding: Number of decimal digits to which % chg value shall round
plot pct_chg   = Round(100 * (data / data[length] - 1), rounding);
pct_chg.AssignValueColor( if pct_chg >= hi_alert then Color.UPTICK
                     else if pct_chg <= lo_alert then Color.DOWNTICK
                     else                             Color.GRAY
                     );
