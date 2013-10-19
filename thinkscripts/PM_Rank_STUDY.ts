input rank_type        = FundamentalType.IMP_VOLATILITY; #Hint: Use to select on what data to compute a percentile rank
input rank_multiplier  = 100; #Hint: 100 turns the percentile into a percentage, 1 leaves it as a decimal
input rounding         = 2; #Hint: number of decimal digits to which rank value shall round
input days_range       = 252; #Hint: 252 ~= 12 mth<br>189 ~= 9 mth<br>126 ~= 6 mth<br>63 ~= 3 mth
input agg_per          = AggregationPeriod.DAY; #Hint: Must be DAY or greater for IV computations
input use_chart_ap     = NO; #Hint: Set to YES to utilize the chart's aggregation period
input show_rank_label  = NO; #Hint: Toggle display of a label to display the rank value
input high_alert       = 50; #Hint: percent equal to or above which to change rank display color
input low_alert        = 50; #Hint: percent strictly below which to change rank display color

# -------------------------------------------------------------------------
# Ensure Aggregation Period is supported per the Fundamental Type specified
# -------------------------------------------------------------------------
#
# IMP_VOLATILITY does not support Aggregration periods less than 1 day. 
# So, display at least the daily IV value

def ap_choice = if use_chart_ap then GetAggregationPeriod() else agg_per;
def ap        = if( ap_choice < AggregationPeriod.DAY && FundamentalType.IMP_VOLATILITY == rank_type, AggregationPeriod.DAY, ap_choice );

# -------------------------------------------------------------------------
# Adjust high and low alert thresholds to account for rank multiplier
# -------------------------------------------------------------------------

def hi_alert  = high_alert * rank_multiplier / 100.0;
def lo_alert  = low_alert  * rank_multiplier / 100.0;

# -------------------------------------------------------------------------
# Fill gaps in the data with usable values
# -------------------------------------------------------------------------
#
# If any NaNs are present in the data, highest/lowest functions will return NaN.
# So, we must fill those NaNs (aka, gaps in the data) with saturated values.
#
#   Since we need both high and low data, this gap fill will require storage x2.
#   It is a waste of memory but I haven't figured out a way to circumvent it due
#   to the initial condition (i.e., the very first value could be a NaN and so
#   there would be no previous valid value to fill with).
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

def  lo   =  Lowest(gapsPeggedHi, days_range); # use gaps pegged hi to ensure correct selection of the min value for known data
def  hi   = Highest(gapsPeggedLo, days_range); # use gaps pegged lo to ensure correct selection of the max value for known data

# If the most recent fundamental data is NaN, this rank result will be NaN
#TODO: Account for NaN rank result

plot rank = Round(rank_multiplier * ( (Fundamental(rank_type, period = ap) - lo) / (hi - lo) ), rounding); 

# -------------------------------------------------------------------------
# Create visual effects, display label if requested
# -------------------------------------------------------------------------

plot p_hi_alert = hi_alert;
plot p_lo_alert = lo_alert;

# set colors based on hi and lo alert thresholds --------------------------

rank.DefineColor("HiAlert", GetColor(5));
rank.DefineColor("Normal", GetColor(7));
rank.DefineColor("LoAlert", GetColor(1));
rank.AssignValueColor( if rank >= hi_alert then rank.Color("HiAlert") else if rank < lo_alert then rank.Color("LoAlert") else rank.Color("Normal") );
p_hi_alert.SetDefaultColor( Color.YELLOW );
p_lo_alert.SetDefaultColor( Color.YELLOW );

# select the label's prefix based on the fundamental type -----------------

# unfortunately, ThinkScript doesn't recognize fundamental type as an enum.
# double unfortunately, we can't simply assign a string to a def.....
# so we have to embed a series if if,then,else statements in the string
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
