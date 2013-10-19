# ======================================================
#Hint: <b>Show OHLC</b><br>Plots previous OHLC and today's OHL
#
# Show OHLC
#
# @author: Patrick Menard, @dranem05, dranem05@alum.mit.edu
#
# While the market is open, this script plots Day aggregation 
# OHLC data for the previous day, and OHL for today. A user
# can toggle which fundamental data she would like displayed.
#
# Today's open plot is RED when price falls below the open
# and GREEN when price is at or above the open.
#
# Conventions:
#
# RT = Real Time : up-to-date context regardless of 
#                  chart time. in live market data,
#                  this means today is actually today.
#                  in on demand, aka simulation mode,
#                  today is the most recent sim time.
#
# CT = Chart Time: historical context that bleeds into 
#                  real time once script traverses all 
#                  historical bars
#
# This script was adapted from the Previous Day Script written
# by Justin Williams (justin@theinfinitygroup.us, @infinitycap) 
# which can be found here:
#
# http://www.shadowtrader.net/forum/viewtopic.php?f=9&t=268&sid=648ed5a68a84c1d587b3720efb2bd20f#p891
# ======================================================

# TODO: show plot line bubbles at an earlier time so they don't block regular trading hours data
# TODO: figure out to do overnight high and low
# TODO: /ES close("DAY")[1] returns close(16:45) EST, but that is extended hours. reg hrs close is 16:15, adjust so we get 16:15 EST value. note this will affect all HLC fundamental data since price can exceed any of those in the 16:15-16:45 period
# TODO: assess merits of the plotLiveHoursOnly option; implement if useful
input prevDayPlotStartTime = 0530; #Hint prevDayPlotStartTime:  time (EST) when previous OHLC data should begin plotting
input marketOpenTime    = 0930; #Hint marketOpenTime:  time (EST) for start of regular trading hours
input marketCloseTime   = 1600; #Hint marketCloseTime: time (EST) for end of regular trading hours

#input plotLiveHoursOnly = YES;  #Hint plotLiveHoursOnly:  Toggle plotting for current day only (YES) or all days (NO)

input showPrevBubbles   = NO; #Hint showPrevBubbles: Enable/Disable bubble on previous day plots
# TODO: assess merits of showing day bubbles; impement if useful
#input showDayBubbles    = NO; #Hint showDayBubbles: Enable/Disable bubble on today's plots
input showOvernightBubbles   = NO; #Hint showOvernightBubbles: Enable/Disable bubble on overnight plots

input showPreviousDay   = YES;  #Hint showPreviousDay:   Enable/Disable display of previous OHLC data
input showPreviousOpen  = NO;   #Hint showPreviousOpen:  Toggle display of previous Open if showPreviousDay is True
input showPreviousHigh  = YES;  #Hint showPreviousHigh:  Toggle display of previous High if showPreviousDay is True
input showPreviousLow   = YES;  #Hint showPreviousLow:   Toggle display of previous Low if showPreviousDay is True
input showPreviousClose = NO;   #Hint showPreviousClose: Toggle display of previous Close if showPreviousDay is True
input previousStyle     = Curve.FIRM;

input showOvernight     = YES;  #Hint showOvernight: Enable/Disable display of extended hours OHLC
input showONHigh        = YES;  #Hint showONHigh:    Toggle display of overnight High if showOvernight is True
input showONLow         = YES;  #Hint showONLow:     Toggle display of overnight Low if showOvernight is True

input showDay           = YES;  #Hint showDay:     Enable/Disable display of day OHL data           
input showDayOpen       = YES;   #Hint showDayOpen: Toggle display of the day's Open if showDay is True 
input showDayHigh       = YES;  #Hint showDayHigh: Toggle display of the day's High if showDay is True 
input showDayLow        = YES;  #Hint showDayLow:  Toggle display of the day's Low if showDay is True
input dayStyle          = Curve.LONG_DASH;


def   mostRecentDay_RT  = GetLastDay();           #TODO: make configurable to other Aggregation Periods
def   currentDay_CT     = GetDay();               #TODO: make configurable to other Aggregation Periods
def   CTDayIsCurrent    = currentDay_CT == mostRecentDay_RT;
def   marketIsOpen      = 0 <= SecondsFromTime( marketOpenTime ) && SecondsTillTime( marketCloseTime ) > 0;
def   ap                = AggregationPeriod.DAY; #TODO: make an input

plot  prevOpen;
plot  prevHigh;
plot  prevLow;
plot  prevClose;
#plot  onHigh;
#plot  onLow;
plot  dayOpen;
plot  dayHigh;
plot  dayLow;

#plot  dbg;

# ------------------------------------------------------
# Collect OHLC data
# ------------------------------------------------------

if CTDayIsCurrent && marketIsOpen
{
    prevOpen  =  open( period = ap )[1];
    prevHigh  =  high( period = ap )[1];
    prevLow   =   low( period = ap )[1];
    prevClose = close( period = ap )[1];
    dayOpen   =  open( period = ap );
    dayHigh   =  high( period = ap );
    dayLow    =   low( period = ap );
}
else
{
    #if ( CTDayIsCurrent || not plotLiveHoursOnly ) && 
    #   ( 0 <= SecondsFromTime( prevDayPlotStartTime )  && SecondsTillTime( marketCloseTime ) > 0 )
    if ( CTDayIsCurrent && 0 <= SecondsFromTime( prevDayPlotStartTime ) && SecondsTillTime( marketCloseTime ) > 0 )
    {
        # Previous data plots only when we are in the current day in RT context (live or simulated)
        prevOpen  =  open( period = ap )[1];
        prevHigh  =  high( period = ap )[1];
        prevLow   =   low( period = ap )[1];
        prevClose = close( period = ap )[1];
    }
    else
    {
        prevOpen  = Double.NaN;
        prevHigh  = Double.NaN;
        prevLow   = Double.NaN;
        prevClose = Double.NaN;
    }
    dayOpen   = Double.NaN;
    dayHigh   = Double.NaN;
    dayLow    = Double.NaN;
}

#if CTDayIsCurrent
#{
#    if SecondsTillTime( marketOpenTime ) > 0
#    {
#        dbg = high( period = ap );
#    }
#    else
#    {
#        dbg = CompoundValue( 1, dbg, Double.NaN);
#    }
#}
#else
#{
#   dbg = dbg;
#}

#dbg.AssignValueColor( Color.RED );

# ------------------------------------------------------
# Hiding
# ------------------------------------------------------

prevOpen.SetHiding(  !(showPreviousDay && showPreviousOpen ) );
prevHigh.SetHiding(  !(showPreviousDay && showPreviousHigh ) );
prevLow.SetHiding(   !(showPreviousDay && showPreviousLow  ) );
prevClose.SetHiding( !(showPreviousDay && showPreviousClose) );

dayOpen.SetHiding(   !(showDay && showDayOpen)  );
dayHigh.SetHiding(   !(showDay && showDayHigh)  );
dayLow.SetHiding(    !(showDay && showDayLow )  );

#prevOpen.HideBubble();
#prevHigh.HideBubble();
#prevLow.HideBubble();
#prevClose.HideBubble();
#dayOpen.HideBubble();
#dayHigh.HideBubble();
#dayLow.HideBubble();

# ------------------------------------------------------
# Set plot look and feel
# ------------------------------------------------------

#def isMarketCloseTime   =  secondsFromTime( marketCloseTime ) == 0 && secondsTillTime( marketCloseTime ) == 0;
def isMarketOpenTime    =  SecondsFromTime( marketOpenTime  ) == 0 && SecondsTillTime( marketOpenTime  ) == 0;
def prevBubbleIsEnabled = isMarketOpenTime && showPrevBubbles;
#def dayBubbleIsEnabled  = isMarketOpenTime && showDayBubbles;

# Open Plot Look & Feel --------------------------------

prevOpen.AssignValueColor( Color.DARK_GRAY );            # Strong Gray
prevOpen.SetStyle( previousStyle );
dayOpen.AssignValueColor( if close >= dayOpen then Color.GREEN else Color.RED );
dayOpen.SetStyle( Curve.MEDIUM_DASH );
AddChartBubble( !IsNaN( prevOpen ) && prevBubbleIsEnabled && showPreviousDay && showPreviousOpen,
                prevOpen, "PO", prevOpen.TakeValueColor() );

# High Plot Look & Feel --------------------------------

prevHigh.AssignValueColor( CreateColor(255, 255,   0) ); # Strong Yellow
dayHigh.AssignValueColor(  CreateColor(255, 255, 100) ); # Weak Yellow
prevHigh.SetStyle( previousStyle );
dayHigh.SetStyle( dayStyle );
AddChartBubble( !IsNaN( prevHigh ) && prevBubbleIsEnabled && showPreviousDay && showPreviousHigh,
                prevHigh, "PH", prevHigh.TakeValueColor() );

# Low Plot Look & Feel ---------------------------------

prevLow.AssignValueColor(  CreateColor(255,   0, 255) ); # Strong Magenta
dayLow.AssignValueColor(   CreateColor(255, 100, 255) ); # Weak Magenta
prevLow.SetStyle( previousStyle );
dayLow.SetStyle( dayStyle );
AddChartBubble( !IsNaN( prevLow  )  && prevBubbleIsEnabled && showPreviousDay && showPreviousLow,
                prevLow , "PL", prevLow.TakeValueColor(), no );

# Close Plot Look & Feel -------------------------------

prevClose.AssignValueColor( Color.DARK_ORANGE );        # Strong Orange
prevClose.SetStyle( previousStyle );
AddChartBubble( !IsNaN( prevClose ) && prevBubbleIsEnabled && showPreviousDay && showPreviousClose,
                prevClose, "PC", prevClose.TakeValueColor() );