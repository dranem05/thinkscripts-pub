# =============================================================================
#Hint: <b>PM Percent Change</b>\nCalculates the percent change in value from now and N periods ago where<li>value: any data type enumerated by FundamentalData such as CLOSE, IV, etc.</li><li>N: user specified look back length</li><li>period: user or chart selected aggregation period such as FIVE_MIN, DAY, WEEK, etc.</li>
#
# PM Percent Change
#
# @author: Patrick Menard, @dranem05, dranem05@alum.mit.edu
#
# This script calculates the percent change in value from now and N periods ago
# where:
#
#     value: data type enumerated by FundamentalData := CLOSE, IV, VOLUME, etc.
#         N: user specified look back length
#    period: user or chart selected aggregation period := MIN, DAY, WEEK, etc.
#
# This script can be used as a plot and as a label. If displayed on a lower
# subgraph, the % chg and its hi and lo alert triggered instances will be
# shown as it occurred over time. If 'show_label' is enabled, the most recent
# % chg will be displayed on the chart. To use this script purely as a label
# on the main price chart, set 'label_only' to YES in the script settings window
#
# This script utilized ThinkOrSwim's built-in PercentChg script and the 
# customizability provided in the PM_Rank script as inspiration.
#
# LICENSE ---------------------------------------------------------------------
#
# This PM_PercentChg script is free software distributed under the terms of the
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


input label_only       = YES; #Hint label_only: use this script only as a label (supercedes 'show_label')
input show_label       = YES; #Hint show_label: Toggle display of a label to display the % chg value (superceded by 'label_only')
input data_type        = FundamentalType.CLOSE; #Hint data_type: Data on which to compute a % chg
input length           = 10; #Hint length: 252 ~= 12 mth<br>189 ~= 9 mth<br>126 ~= 6 mth<br>63 ~= 3 mth
input period           = AggregationPeriod.DAY; #Hint period: Must be DAY or greater for IV computations
input use_chart_ap     = NO; #Hint use_chart_ap: Set to YES to utilize the chart's aggregation period
input high_alert       =  5.0; #Hint high_alert: Percent equal to or above which to change % chg display color
input low_alert        = -5.0; #Hint low_alert: Percent equal to or below which to change % chg display color
input multiplier       = 100; #Hint multiplier: 100 turns the % chg into a percentage, 1 leaves it as a decimal
input rounding         = 2; #Hint rounding: Number of decimal digits to which % chg value shall round
input no_nans          = YES; #Hint no_nans: If YES, return the previous % chg if current data is NaN

# -------------------------------------------------------------------------
# Ensure Aggregation Period is supported per the Fundamental Type specified
# -------------------------------------------------------------------------
#
# IMP_VOLATILITY does not support Aggregration periods less than 1 day. 
# So, display at least the daily IV value

def ap_choice = if use_chart_ap then GetAggregationPeriod() else period;
def ap        = If( ap_choice < AggregationPeriod.DAY && FundamentalType.IMP_VOLATILITY == data_type, AggregationPeriod.DAY, ap_choice );

# -------------------------------------------------------------------------
# Adjust high and low alert thresholds to account for % chg multiplier
# -------------------------------------------------------------------------

plot pct_chg; # declare here so it appears first in strategy settings box on TOS
plot hi_alert = high_alert * multiplier / 100.0;
plot lo_alert = low_alert  * multiplier / 100.0;

# -------------------------------------------------------------------------
# Compute the percent change
# -------------------------------------------------------------------------

# If 'no_nans' is enabled, the previously computed % chg is returned when
# the fundamental data is NaN. If there is no previously computed % chg,
# the value returned will be what TOS uses to initialize variables: 
#
#    0 as of 11/4/2013.
#
# Otherwise, NaN will be returned when a gap is encountered.
#
# TODO: may need to distinguish between gap meaning no data period vs. a temporary hole in the data (like a halt)

#def data      = Fundamental(data_type, period=ap); #TODO: creates an array or maps 'data' to this fundamental array?
#def data      = close(period=ap); #TODO: creates an array or maps 'data' to this fundamental array?
#def pct_chg_v = if   no_nans && (IsNaN(data) or IsNaN(data[length]))
#                then pct_chg_v[1]
#                else Round(multiplier * (data / data[length] - 1), rounding);

# Using 'data', whether def or plot, to reference Fundamental() does not
# work as one would assume. During market hours (OnDemand or Live), the
# result returned for data[N] is the same as data[0]. Whereas explicitly
# doing Fundamental(dt,pd)[N] returns the actual value for N periods ago.
# The same is true if we reference directly 'close', 'open', etc.
#
# So, we have to be explicit in code until this ThinkScript error is fixed.

def pct_chg_v = if   no_nans && (IsNaN(Fundamental(data_type, period=ap)) or IsNaN(Fundamental(data_type, period=ap)[length]))
                then pct_chg_v[1]
                else Round(multiplier * (Fundamental(data_type, period=ap) / Fundamental(data_type, period=ap)[length] - 1), rounding);
pct_chg       = pct_chg_v;

# DEBUGGING TOOLS
#AddLabel(1, Concat("d[0]: ", data[0]), Color.CYAN);
#AddLabel(1, Concat("d[" + length + "]: ", data[length]), Color.CYAN);
#AddLabel(1, Concat("c[0]: ", close(period=ap)[0]), Color.CYAN);
#AddLabel(1, Concat("c[" + length + "]: ", close(period=ap)[length]), Color.CYAN);
#AddLabel(1, Concat("f[0]: ", Fundamental(data_type, period=ap)[0]), Color.CYAN);
#AddLabel(1, Concat("f[" + length + "]: ", Fundamental(data_type, period=ap)[length]), Color.CYAN);

# -------------------------------------------------------------------------
# Create visual effects, display label if requested
# -------------------------------------------------------------------------

# set colors based on hi and lo alert thresholds --------------------------

pct_chg.DefineColor("HiAlert", Color.UPTICK);
pct_chg.DefineColor("Normal" , Color.GRAY);
pct_chg.DefineColor("LoAlert", Color.DOWNTICK);
pct_chg.AssignValueColor( if pct_chg >= hi_alert then pct_chg.Color("HiAlert") else if pct_chg <= lo_alert then pct_chg.Color("LoAlert") else pct_chg.Color("Normal") );
hi_alert.SetDefaultColor( Color.YELLOW );
lo_alert.SetDefaultColor( Color.YELLOW );

# select the label's prefix based on the fundamental type -----------------

# cannot use switch/case as ThinkScript's fundamental types are not enums

AddLabel(show_label or label_only, 
              Concat( if data_type == FundamentalType.IMP_VOLATILITY then "IV "
         else if data_type == FundamentalType.OPEN           then "$O " 
         else if data_type == FundamentalType.HIGH           then "$H " 
         else if data_type == FundamentalType.LOW            then "$L " 
         else if data_type == FundamentalType.CLOSE          then "PRICE "
         else if data_type == FundamentalType.HL2            then "$HL2 " 
         else if data_type == FundamentalType.HLC3           then "$HLC3 " 
         else if data_type == FundamentalType.OHLC4          then "$OHLC4 " 
         else if data_type == FundamentalType.VWAP           then "VWAP "
         else if data_type == FundamentalType.VOLUME         then "VOLUME "
         else if data_type == FundamentalType.OPEN_INTEREST  then "OI " 
         else                                                     "",
         "%CHG("+length+") " + pct_chg), 
         pct_chg.TakeValueColor() );

# hide plots if user wants labels only ------------------------------------

hi_alert.SetHiding( label_only );
lo_alert.SetHiding( label_only );
pct_chg.SetHiding( label_only );