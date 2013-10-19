#Hint: <b>PM Sanbox</b><br> This is a sandbox to play around with ThinkScript Code

declare lower;

input bogus = 0; #Hint bogus: Nothing really
input dayStyle = Curve.FIRM;

plot day = getDay();
plot lastDay = getLastDay();
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