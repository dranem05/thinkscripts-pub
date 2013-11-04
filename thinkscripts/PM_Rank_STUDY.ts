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
#     aggregation period's less than DAY. This script thus defaults to DAY
#     if the user specifies IMP_VOLATILITY as the 'rank_type' and an 
#     aggregation period less than DAY.
#
#   > During market hours, whether OnDemand or Live, TOS will return real 
#     time "tick" data for the most recent value of the Fundamental Data 
#     Type specified, regardless of aggregation period. As a result, the 
#     rank value will also change in real time, except for IV as described
#     in the previous note.
#
#   > Sometimes fundamental data will be returned as NaN. As a result,
#     current rank will return NaN. If instead the previous valid non-NaN
#     rank is desired, set 'no_nan_rank' to yes. 
#
#   > The "previous valid non-NaN data" is based on the aggregation period
#     and not real time streaming data available during market hours. For
#     example, if ap is DAY, yesterday's rank will be returned. This could
#     have the effect of "jumping" rank values if the real time streaming
#     data has NaN gaps.
#
# This script can be used as a plot and as a label. If displayed on a lower
# subgraph, the rank and its hi and lo alert triggered instances will be
# shown as it occurred over time. If 'show_rank_label' is enabled, the most
# recent percentile rank will be displayed on the chart. To use this script
# purely as a label on the main price chart, make sure to uncheck 'show plot'
# in the script settings window.
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


input rank_type        = FundamentalType.IMP_VOLATILITY; #Hint rank_type: Data on which to compute a percentile rank
input rank_multiplier  = 100; #Hint rank_multiplier: 100 turns the percentile into a percentage, 1 leaves it as a decimal
input rounding         = 2; #Hint rounding: Number of decimal digits to which rank value shall round
input days_range       = 252; #Hint days_range: 252 ~= 12 mth<br>189 ~= 9 mth<br>126 ~= 6 mth<br>63 ~= 3 mth
input agg_per          = AggregationPeriod.DAY; #Hint agg_per: Must be DAY or greater for IV computations
input use_chart_ap     = NO; #Hint use_chart_ap: Set to YES to utilize the chart's aggregation period
input show_rank_label  = YES; #Hint show_rank_label: Toggle display of a label to display the rank value
input no_nan_rank      = YES; #Hint no_nan_rank: If YES, return the previous rank if current data is NaN
input high_alert       = 50; #Hint high_alert: Percent equal to or above which to change rank display color
input low_alert        = 50; #Hint low_alert: Percent strictly below which to change rank display color
#input real_time        = YES; #Hint real_time: use chart ap as the data's current value (ideally this would be tick data)
# real_time flag is currently unnecessary as streaming "tick" data is received for data[0] call regardless of aggregation period and except for IV

# -------------------------------------------------------------------------
# Ensure Aggregation Period is supported per the Fundamental Type specified
# -------------------------------------------------------------------------
#
# IMP_VOLATILITY does not support Aggregration periods less than 1 day. 
# So, display at least the daily IV value.
#
# TODO: Eliminate Agg Period checking code for IV once imp_vol() supports all agg periods

def ap_choice = if use_chart_ap then GetAggregationPeriod() else agg_per;
def ap        = if( ap_choice < AggregationPeriod.DAY && FundamentalType.IMP_VOLATILITY == rank_type, AggregationPeriod.DAY, ap_choice );

# -------------------------------------------------------------------------
# Adjust high and low alert thresholds to account for rank multiplier
# -------------------------------------------------------------------------

#TODO: may need declare rank last in order for this value to be returned as the study's value

plot rank;  # declare here so it appears first in strategy settings box on TOS 
plot hi_alert = high_alert * rank_multiplier / 100.0;
plot lo_alert = low_alert  * rank_multiplier / 100.0;

# -------------------------------------------------------------------------
# Fill gaps in the data with usable values
# -------------------------------------------------------------------------
#
# If any NaNs are present in the data, highest/lowest functions will return NaN.
# So, we must fill those NaNs (aka, gaps in the data) with useful data that
# will not alter the data to cause highest/lowest to return incorrect values.
# We will fill the gap with the previous value received.
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

def data = if !IsNaN(Fundamental(rank_type, period=ap)) then Fundamental(rank_type, period=ap) else data[1];

# -------------------------------------------------------------------------
# Query the high and low range of the data and compute the present rank
# -------------------------------------------------------------------------
#
# If 'no_nan_rank' is enabled by the user, the gap filled data will be used
# to compute rank. This essentially has the effect of computing the previous
# AggregationPeriod's (e.g. DAY) rank when a gap is encountered.
#
# Otherwise, the non gap filled data set will be used and result in a NaN
# computation for rank when a gap is encountered.
#
# TODO: may need to distinguish between gap meaning no data period vs. a temporary hole in the data (like a halt)

def  lo   =  Lowest(data, days_range);
def  hi   = Highest(data, days_range);
rank = Round(rank_multiplier * ( (if no_nan_rank then data else Fundamental(rank_type, period=ap)) - lo ) / (hi - lo), rounding); 

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

# unfortunately, ThinkScript doesn't recognize fundamental type as an enum.
# double unfortunately, we can't simply assign a string to a def.....
# so we have to embed a series of if,then,else statements in the string
# portion of the AddLabel function instead of this clenaer 
# switch/case/assignment method commented out below.

#def lbl_prefix;
#switch ( rank_type ) {
#case FundamentalType.IMP_VOLATILITY: lbl_prefix = "IV";
#case FundamentalType.OPEN          : lbl_prefix = "$O";
#case FundamentalType.HIGH          : lbl_prefix = "$H";
#case FundamentalType.LOW           : lbl_prefix = "$L";
#case FundamentalType.CLOSE         : lbl_prefix = "PRICE";
#case FundamentalType.HL2           : lbl_prefix = "$HL2";
#case FundamentalType.HLC3          : lbl_prefix = "$HLC3";
#case FundamentalType.OHLC4         : lbl_prefix = "$OHLC4";
#case FundamentalType.VWAP          : lbl_prefix = "VWAP";
#case FundamentalType.VOLUME        : lbl_prefix = "VOLUME ";
#case FundamentalType.OPEN_INTEREST : lbl_prefix = "OI";
#default                            : lbl_prefix = "";       
#}

AddLabel(show_rank_label, 
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
         "RANK " + rank), 
         rank.TakeValueColor() );
