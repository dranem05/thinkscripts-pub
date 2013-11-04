# =============================================================================
#Hint: <b>PM Rank</b>\nCalculates the percentile rank for the current value of the selected data type (IV, Price, etc.) as it compares to its range over a user specified number of days. It is essentially (value-lowest)/(highest-lowest).\n\nThis script can be used as a plot and as a label.
#
# PM Rank
#
# @author: Patrick Menard, @dranem05, dranem05@alum.mit.edu
#
# This script calculates the percentile rank for the current value of the 
# selected data type (IV, Price, etc.) as it compares to its range over a user 
# specified number of days. It is essentially (value-lowest)/(highest-lowest).
#
# Notes:
#
#   > As of 2013-10-20, the TOS imp_volatility() function does not support
#     aggregation period's less than DAY. Thus this script defaults to DAY
#     if the user specifies IMP_VOLATILITY as the 'rank_type' and an 
#     aggregation period less than DAY.
#
#   > During market hours, whether OnDemand or Live, TOS will return real 
#     time "tick" data for the most recent value of the Fundamental Data 
#     Type specified, regardless of aggregation period. As a result, the 
#     rank value will also change in real time, except for IV as described
#     in the previous note. In OnDemand, imp_volatility() returns NaN
#     whereas in Live mode, imp_volatility() returns a non-NaN value that
#     does change to some degree.
#
#   > Sometimes fundamental data will be returned as NaN. As a result,
#     current rank will return NaN. If instead the previous valid non-NaN
#     rank is desired, set 'no_nan_rank' to yes (YES is the default setting)
#
#   > The "previous valid non-NaN data" is based on the value computed for
#     the previous rank. Very simply, if fundamental data is NaN, then
#     rank[1] will be returned, otherwise (value-lowest)/(highest-lowest).
#     Due to initial conditions, it is possible for the first value (and
#     following values until non-NaN data emerges) to be zero.
#
#     What using rank[1] means for real time streaming data (market hours
#     data in OnDemand mode or Live mode) depends on how the underlying
#     TOS ThinkScript implementation populates/grows the rank array
#     during this period regardless of AP.
#
# This script can be used as a plot and as a label. If displayed on a lower
# subgraph, the rank and its hi and lo alert triggered instances will be
# shown as it occurred over time. If 'show_rank_label' is enabled, the most
# recent percentile rank will be displayed on the chart. To use this script
# purely as a label on the main price chart, set 'label_only' to YES in the
# script settings window.
#
# LICENSE ---------------------------------------------------------------------
#
# This PM_Rank script is free software distributed under the terms of the MIT
# license reproduced here:
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


input label_only       = YES; #Hint label_only: use this script only as a label (supercedes 'show_rank_label')
input show_rank_label  = YES; #Hint show_rank_label: Toggle display of a label to display the rank value (superceded by 'label_only')
input rank_type        = FundamentalType.IMP_VOLATILITY; #Hint rank_type: Data on which to compute a percentile rank
input rank_multiplier  = 100; #Hint rank_multiplier: 100 turns the percentile into a percentage, 1 leaves it as a decimal
input rounding         = 2; #Hint rounding: Number of decimal digits to which rank value shall round
input days_range       = 252; #Hint days_range: 252 ~= 12 mth<br>189 ~= 9 mth<br>126 ~= 6 mth<br>63 ~= 3 mth
input agg_per          = AggregationPeriod.DAY; #Hint agg_per: Must be DAY or greater for IV computations
input use_chart_ap     = NO; #Hint use_chart_ap: Set to YES to utilize the chart's aggregation period and supercede 'agg_per'
input no_nan_rank      = YES; #Hint no_nan_rank: If YES, return the previous rank if current data is NaN
input high_alert       = 50; #Hint high_alert: Percent equal to or above which to change rank display color
input low_alert        = 50; #Hint low_alert: Percent strictly below which to change rank display color

# -------------------------------------------------------------------------
# Ensure Aggregation Period is supported per the Fundamental Type specified
# -------------------------------------------------------------------------
#
# IMP_VOLATILITY does not support Aggregration periods less than 1 day.
# So, display at least the daily IV value.
#
# TODO: Eliminate Agg Period checking code for IV once imp_vol() supports all agg periods

def ap_choice = if use_chart_ap then GetAggregationPeriod() else agg_per;
def ap        = If( ap_choice < AggregationPeriod.DAY && FundamentalType.IMP_VOLATILITY == rank_type, AggregationPeriod.DAY, ap_choice );

# -------------------------------------------------------------------------
# Adjust high and low alert thresholds to account for rank multiplier
# -------------------------------------------------------------------------

#TODO: may need to declare rank last in order for this value to be returned as the study's value

plot rank;  # declare here so it appears first in strategy settings box on TOS 
plot hi_alert = high_alert * rank_multiplier / 100.0;
plot lo_alert = low_alert  * rank_multiplier / 100.0;

# -------------------------------------------------------------------------
# Fill gaps in the data with usable values
# -------------------------------------------------------------------------
#
# If any NaNs are present in the data, highest/lowest functions will return NaN.
# These NaNs (aka, gaps in the data) must be filled in a way that does not cause
# the highest/lowest functions to return incorrect values.
#
# Method 1 is to fill gaps with the previous value received.
#
# Note:  
#
#   There are two ways this could break:
#
#   1 - every value is NaN
#
#       > case is moot, can't remedy this
#
#   2 - first value ever is NaN and is within 'days_range' of current value
#
#       > this becomes case 1 if every subsequent value of F(FType) is NaN
#         as every data[0] value will be set to data[1] which is NaN
#
#       > the instant any non-NaN value emerges from F(FType) no other NaNs
#         will ever pollute the 'data' array. however any queries where
#         that first value is still within 'days_range' will fail with NaN
#         being returned as the rank value

#def data = if !IsNaN(Fundamental(rank_type, period=ap)) then Fundamental(rank_type, period=ap) else data[1];

#   Unfortunately, the above method 1 doesn't work if 'ap'=DAY and the chart's 
#   actual ap is less than DAY (e.g., 5 mins). This method, taken from a native
#   TOS ThinkScript, is technically incorrect since TOS initializes values to 0.
#   Normally, we aren't affected because the erroneous value falls off the edge 
#   of our lookback period. However, this incorrectness rears its head with real
#   time streaming data on a 5 min chart and user ap set to DAY: 
#
#      data[1] returns 0 and lowest is permanently 0
#
#   This difference in behavior may point to some underlying ThinkScript issue...

# Method 2 is to fill gaps with saturated values.
#
#   Since we need both high and low data, this method require storage x2.
#
# TODO: Figure out how to eliminate this waste of memory

def gapsPeggedHi;
def gapsPeggedLo;

if IsNaN(Fundamental(rank_type, period = ap))
{
    gapsPeggedHi = Double.POSITIVE_INFINITY;
    gapsPeggedLo = Double.NEGATIVE_INFINITY;
}
else
{
    gapsPeggedHi = Fundamental(rank_type, period = ap);
    gapsPeggedLo = Fundamental(rank_type, period = ap);
}

# -------------------------------------------------------------------------
# Query the high and low range of the data and compute the present rank
# -------------------------------------------------------------------------
#
# If 'no_nan_rank' is enabled by the user, the previously computed rank
# will be returned if gaps are encountered in the fundamental data. If 
# there is no previously computed rank, the value returned will be what 
# TOS uses to initialize variables: 0 as of 11/4/2013.
#
# Otherwise, NaN will be returned when a gap is encountered.
#
# TODO: may need to distinguish between gap meaning no data period vs. a temporary hole in the data (like a halt)

#def  lo   =  Lowest(data, days_range); # re-enable if 'data' becomes valid again for all scenarios
#def  hi   = Highest(data, days_range); # re-enable if 'data' becomes valid again for all scenarios
def  lo   =  Lowest(gapsPeggedHi, days_range); # use gaps pegged hi to ensure correct selection of the min value for known data
def  hi   = Highest(gapsPeggedLo, days_range); # use gaps pegged lo to ensure correct selection of the max value for known data

# Cannot use recursion if variable is a plot. So compute using a 'def' and
# copy result to a 'plot'. This is another waste of memory that only
# functions to provide non-nan values if current fundamental data is NaN.
#
# TODO: figure out a way to eliminate this waste of space

def  rank_val = if IsNaN(Fundamental(rank_type, period=ap)) && no_nan_rank then rank_val[1] else Round(rank_multiplier * (Fundamental(rank_type, period=ap) - lo) / (hi - lo), rounding); 
rank = rank_val;

# DEBUGGING TOOLS
#AddLabel(1, Concat("lo: ", lo), Color.CYAN);
#AddLabel(1, Concat("hi: ", hi), Color.CYAN);
#AddLabel(1, Concat("d[0]: ", data[0]), Color.CYAN);
#AddLabel(1, Concat("d[1]: ", data[1]), Color.CYAN);
#AddLabel(1, Concat("f[0]: ", Fundamental(rank_type, period=ap)), Color.CYAN);

# -------------------------------------------------------------------------
# Create visual effects, display label if requested
# -------------------------------------------------------------------------

# set colors based on hi and lo alert thresholds --------------------------

rank.DefineColor("HiAlert", Color.UPTICK);   #GetColor(5)); # RED
rank.DefineColor("Normal" , Color.GRAY);     #GetColor(7)); # GRAY
rank.DefineColor("LoAlert", Color.DOWNTICK); #GetColor(1)); # CYAN
rank.AssignValueColor( if rank >= hi_alert then rank.Color("HiAlert") else if rank < lo_alert then rank.Color("LoAlert") else rank.Color("Normal") );
hi_alert.SetDefaultColor( Color.YELLOW );
lo_alert.SetDefaultColor( Color.YELLOW );

# select the label's prefix based on the fundamental type -----------------

# cannot use switch/case as ThinkScript's fundamental types are not enums

AddLabel(show_rank_label OR label_only, 
              Concat( if rank_type == FundamentalType.IMP_VOLATILITY then "IV "
         else if rank_type == FundamentalType.OPEN           then "$O " 
         else if rank_type == FundamentalType.HIGH           then "$H " 
         else if rank_type == FundamentalType.LOW            then "$L " 
         else if rank_type == FundamentalType.CLOSE          then "PRICE "
         else if rank_type == FundamentalType.HL2            then "$HL2 " 
         else if rank_type == FundamentalType.HLC3           then "$HLC3 " 
         else if rank_type == FundamentalType.OHLC4          then "$OHLC4 " 
         else if rank_type == FundamentalType.VWAP           then "VWAP "
         else if rank_type == FundamentalType.VOLUME         then "VOLUME "
         else if rank_type == FundamentalType.OPEN_INTEREST  then "OI " 
         else                                                     "",
         "RANK("+days_range+") " + rank), 
         rank.TakeValueColor() );

# hide plots if user wants labels only ------------------------------------

hi_alert.SetHiding( label_only );
lo_alert.SetHiding( label_only );
rank.SetHiding( label_only );

