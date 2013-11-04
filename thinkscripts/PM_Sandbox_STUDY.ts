#Hint: <b>PM Sanbox</b><br>This is a sandbox to play around with ThinkScript Code <li>testing hint markup</li><li>and again</li>

declare lower;

input bogus = 0; #Hint bogus: Nothing really
input dayStyle = Curve.FIRM;

# ------------------------------------------------------------------
# Test Referencing
# ------------------------------------------------------------------

#plot blah = reference My_IV_Percentile; # cannot reference user created scripts
#plot blah = reference SimpleMovingAvg;  # can reference builtin scripts

# ------------------------------------------------------------------
# Test assumptions on GetDay() and GetLastDay()
# ------------------------------------------------------------------

plot day = GetDay();         # gets day based on where we are in the chart
plot lastDay = GetLastDay(); # returns the most recent day available in simulation time context or real time context
plot diff = lastDay - day;
def  val;

if (bogus == 0)
{
    val = diff;
}
else
{
    val = 23;
}

day.SetStyle( dayStyle );
diff.Hide();

# [PASS] GetDay() is whatever the day is based on where we are in the chart
# [PASS] GetLastDay() is the most recent day based on frame of reference (simulation or real life)

# ------------------------------------------------------------------
# Test IV Rank Stuff
# ------------------------------------------------------------------

# The problem here is that the Lowest/Highest functions will return 
# NaN if any NaNs are present in the data, and neither has an option
# to "ignore" NaNs

input period = 252; # default to 60 trading days ~3 months; 252 ~= 12 months
input ap = AggregationPeriod.DAY; #getAggregationPeriod();
#def iv = imp_volatility(period=ap); # if any NANs are present in the data, highest/lowest functions will return NaN
def iv = if !IsNaN(imp_volatility(period = ap)) then imp_volatility(period = ap) else 0;
def iv2 = if !IsNaN(imp_volatility(period = ap)) then imp_volatility(period = ap) else iv2[1];
def ivGapsPeggedHi = if IsNaN(imp_volatility(period = ap)) then Double.POSITIVE_INFINITY else imp_volatility(period = ap);
def ivGapsPeggedLo = if IsNaN(imp_volatility(period = ap)) then Double.NEGATIVE_INFINITY else imp_volatility(period = ap);
def lo;
def hi;
def use_gap = yes;
#def use_gap = NO;
if use_gap
{
    lo = Lowest(ivGapsPeggedHi, period);
    hi = Highest(ivGapsPeggedLo, period);
}
else
{
    lo = Lowest(iv2, period);
    hi = Highest(iv2, period);
}
def cv = imp_volatility(period = ap);
#plot ivp = ((cv - lo)/(hi-lo)*100);
plot ivp = ((imp_volatility(period = ap) - lo) / (hi - lo) * 100); # if most recent imp_vol data is NaN, this result will be NaN

AddLabel(1, Concat("iv:", iv), Color.CYAN);
AddLabel(1, Concat("iv2:", iv2), Color.CYAN);
AddLabel(1, Concat("cv:", cv), Color.CYAN);
AddLabel(1, Concat("lo:", lo), Color.CYAN);
AddLabel(1, Concat("lo[3]:", lo[3]), Color.CYAN);
AddLabel(1, Concat("hi:", hi), Color.CYAN);
AddLabel(1, Concat("IV%:", ivp), Color.CYAN);
#AddLabel(1,concat("IV%:",ivp),if ivp > 50 then Color.UPTICK else Color.DOWNTICK);

# [FAIL] iv set to 0 if isNaN clobbers the data
# [PASS] gapsPegged code ensures we collect the right hi and lo IV values for the specified range
# [PASS] using recursive iv2[1] does not cause compilation error and also returns same needed values as gapsPegged does but with less waste of memory and coding
# [FAIL] cannot obtain realtime iv changes during the trading data (imp_vol() function returns NaN everytime) 
# [FAIL] if chart AP is less than designated AP, the iv2[1] recursive trick does not work and lowest keeps returning zero (e.g., AP = DAY and chart AP = 5 mins)


# ------------------------------------------------------------------
# Test input types 
# ------------------------------------------------------------------

input data_type  = FundamentalType.IMP_VOLATILITY; # allows user to change fundamental type
input data_type2 = close;                          # shows all fundamental types, but skips need to call Fundamental(FTYPE..) in code

# [PASS] both methods show all fundamental types
# [FAIL] currently no way to discern FundamentalType in code if using method 2

# ------------------------------------------------------------------
# Test creation of color select widget if using CreateColor
# ------------------------------------------------------------------

plot labelColor = 0; # only to pull in color select widget
labelColor.SetHiding(1) ; #never want to show this
labelColor.HideBubble();
labelColor.HideTitle();
labelColor.DefineColor("Up",   CreateColor(255,   0, 255)); # Strong Magenta
labelColor.DefineColor("Down", CreateColor(255, 100, 255)); # Weak Magenta
AddLabel(1, Concat("IV% 2: ", ivp), if IsNaN(ivp) then Color.CYAN else if ivp >= 50.0 then labelColor.Color("Up") else labelColor.Color("Down"));

# [PASS] Yup, this works, a color widget is made available to the user in the settings dialogue.

# ------------------------------------------------------------------
# Test concat
# ------------------------------------------------------------------

AddLabel(1, Concat(FundamentalType.HIGH, " RANK")); # This concatenates a the number to which HIGH is equal to

# [FAIL] this doesn't translate HIGH into a string "HIGH", just gives the id code of HIGH

# ------------------------------------------------------------------
# Test Real Time Price Changes
# ------------------------------------------------------------------

# note:
#   - secondary aggregation period cannot be less than the primary aggregation period defined by chart settings

def cap = getAggregationPeriod(); # get the primary aggregation period (the chart's ap)
def cp   = close;                 # implicitly call out the most recent closing price based on implicit chart ap
def cpex = close(period=cap);     # implicitly call out the most recent closing price based on explicit chart ap
def cval = close(period=cap)[0];  # explicitly call out the most recent closing price based on explicit chart ap
def pval = close(period=ap)[10];  # explicitly call out the closing price 10 periods ago based on secondary ap
# Due to mixed aggregation periods, pct_chg will be computed based
# on something funky. I still have yet to decipher what values it
# is using, but the closest result is from AP[1]/AP[10], not CAP[0]/CAP[10]
# as expected from using mixed type per thinkscript website:
# http://tlc.thinkorswim.com/center/charting/thinkscript/tutorials/Chapter-12---Referencing-Secondary-Aggregation
plot pct_chg  = round(100 * (close(period=cap) / close(period=ap)[10] - 1),2); # computes unexpected value unless cap == ap
plot pct_chg2 = round(100 * (cval / pval - 1),2); # computes desired result
plot pct_chg3 = round(100 * (cp   / pval - 1),2); # also computes desired result, but shouldn't according to thinkscript website
plot pct_chg4 = round(100 * (cpex / pval - 1),2); # also computes desired result, but shouldn't according to thinkscript website
AddLabel(1, Concat("%CHG ",pct_chg));
AddLabel(1, Concat("%CHG2 ",pct_chg2));
AddLabel(1, Concat("%CHG3 ",pct_chg3));
AddLabel(1, Concat("%CHG3 ",pct_chg4));
AddLabel(1, Concat("pri(cap) ", close(period=cap))); # at aggregation period of the chart
AddLabel(1, Concat("pri(ap) ", close(period=ap)));   # at aggregation period of DAY
AddLabel(1, Concat("pri(ap)[1] ", close(period=ap)[1]));   # at aggregation period of DAY
AddLabel(1, Concat("pri(ap)[10] ", close(period=ap)[10]));   # at aggregation period of DAY
AddLabel(1, Concat("pri(ap)[11] ", close(period=ap)[11]));   # at aggregation period of DAY
AddLabel(1, Concat("pri(cap)[1] ", close(period=cap)[1]));   # at aggregation period of chart
AddLabel(1, Concat("pri(cap)[10] ", close(period=cap)[10]));   # at aggregation period of chart
AddLabel(1, Concat("pri(cap)[11] ", close(period=cap)[11]));   # at aggregation period of chart

# [FAIL] do not get correct pct_chg if use fundamental function directly in one line but w/ two aggregation types
# [PASS] we do get correct pct_chg if use fundamental function directly and both aggregation types are equal
# [PASS] we do get correct pct_chg if we use the data indirectily via explicit variables
# [FAIL] expected incorrect pct_chg if did not call out explicit values we wanted in the variables
# [PASS] get real time price changes in the data if Aggregation Period <  DAY (i.e., 4 hrs to 1 min)
# [PASS] get real time price changes in the data if aggregation period >= DAY (at least in ondemand)
