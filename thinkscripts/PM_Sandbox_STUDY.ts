#Hint: <b>PM Sanbox</b><br> This is a sandbox to play around with ThinkScript Code

declare lower;

input bogus = 0; #Hint bogus: Nothing really
input dayStyle = Curve.FIRM;

#plot blah = reference My_IV_Percentile; # cannot reference user created scripts
#plot blah = reference SimpleMovingAvg;  # can reference builtin scripts

plot day = GetDay();
plot lastDay = GetLastDay();
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

# IV Rank Stuff
input period = 252; # default to 60 trading days ~3 months; 252 ~= 12 months
input ap = AggregationPeriod.DAY; #getAggregationPeriod();
#def iv = imp_volatility(period=ap); # if any NANs are present in the data, highest/lowest functions will return NaN
def iv = if !IsNaN(imp_volatility(period=ap)) then imp_volatility(period=ap) else 0;
def ivGapsPeggedHi = if isnan(imp_volatility(period=ap)) then Double.POSITIVE_INFINITY else imp_volatility(period=ap);
def ivGapsPeggedLo = if isnan(imp_volatility(period=ap)) then Double.NEGATIVE_INFINITY else imp_volatility(period=ap);
def lo;
def hi;
def use_gap = YES;
#def use_gap = NO;
if use_gap
{
 lo = lowest(ivGapsPeggedHi,period); 
 hi = highest(ivGapsPeggedLo,period);
}
else
{
 lo = lowest(iv,period); 
 hi = highest(iv,period);
}
def cv = imp_volatility(period=ap);
#plot ivp = ((cv - lo)/(hi-lo)*100);
plot ivp = ((imp_volatility(period=ap) - lo)/(hi-lo)*100); # if most recent imp_vol data is NaN, this result will be NaN

AddLabel(1,concat("iv:",iv),Color.CYAN);
AddLabel(1,concat("cv:",cv),Color.CYAN);
AddLabel(1,concat("lo:",lo),Color.CYAN);
AddLabel(1,concat("lo[3]:",lo[3]),Color.CYAN);
AddLabel(1,concat("hi:",hi),Color.CYAN);
AddLabel(1,concat("IV%:",ivp),Color.CYAN);
#AddLabel(1,concat("IV%:",ivp),if ivp > 50 then Color.UPTICK else Color.DOWNTICK);

input data = FundamentalType.IMP_VOLATILITY;


