PM ThinkScripts
===============
This is a collection of handy thinkscripts for use on the thinkorswim (TOS)
trading platform. There are two types of ThinkScripts:

1. __*ThinkScripts*__  
   These scripts are full powered and intended for use on charts,
   scan queries, and conditional orders. The instructions for 
   importing/exporting ThinkScripts applies to these scripts.

2. __*Custom Quote Scripts*__  
   These scripts are intended for use on watchlists, anywhere
   a custom quote can be inserted as a column, and scan queries. 
   To use these, the user must copy and paste the code into a 
   custom quote thinkscript code area. TOS offers 20 custom quote
   slots.

The workflow for ThinkScripts and Custom Quote Scripts can be made much 
more fluid once TOS enables features open to builtin scripts to user
created scripts. These are features such as the #Wizard keyword, direct 
referencing of user created scripts (not just builtin scripts), not 
creating a copy of referenced thinkscript code when referencing them
as a condition in a custom script (this causes changes in the original
to not propagate to the custom script), etc.

What ThinkScripts Are Available?
--------------------------------

__*PM Rank*__  
Calculates the percentile rank for the current value of the selected 
[Fundamental Data][fundamental data] (IV, Price, etc.) as it compares 
to its range over a user or chart specified number of [periods][agg_per]
(FIVE_MIN, DAY, etc). It is essentially `(value-lowest)/(highest-lowest)`.
This script can be used as a plot and as a label.

__*PM Percent Change*__  
Calculates the percent change in value from now and N periods ago where:

  * *value* is any data type enumerated by [Fundamental Data][fundamental data] 
    such as CLOSE, IV, etc., 
  * *N* is any user specified lookback length, and 
  * *period* is any user or chart selected [aggregation period][agg_per] such as 
    FIVE_MIN, DAY, etc.

This script can be used as a plot and as a label.

__*PM Show OHLC*__  
Plots the previous day's OHLC and today's OHL.

__*PM Sandbox*__  
A playground to wrangle with thinkscript syntax, functions, and assumptions.

#### Custom Quote Scripts

__*PM IV Rank CQ*__  
A bare bones distilled version of PM_Rank that only computes the IV Rank
over 252 trading days rounded to one significant digit (one decimal place).
Note, this script colors the value based on where it lays within the rank.
Edit the code to change the lookback period and rank coloring thresholds 
to fit your needs.

__*PM Price Rank CQ*__  
A bare bones distilled version of PM_Rank that only computes the Price Rank
over 252 trading days rounded to one significant digit (one decimal place).
Note, this script colors the value based on where it lays within the rank.
Edit the code to change the lookback period and rank coloring thresholds 
to fit your needs.

__*PM Rank CQ*__  
A bare bones distilled version of PM_Rank with less user input controls. It
calculates the percentile rank over 252 trading days for desired fundamental
data (IV, O, H, L, C, Volume, etc.). Note, this script colors the value based
on where it lays within the rank. Edit the input data source or the lookback
period and rank coloring thresholds to fit your needs.

This one is intended to be imported as a study and referenced for custom
quote scripts and scan queries. Once TOS fixes workflow issues, this will
be the preferred method so there will be one source file for Rank related
computations. Until then, it's easier/faster to use the rank specific cq
scripts above.

__*PM Rank Coloring CQ*__  
This is an example script to show how one can enable the coloring of data
if the core script is referenced. As of 2013-11-09, the TOS limitations
will essentially copy the core script code into a custom script using the 
`script {  } ` notation and add the coloring details below it.

How Do I Install/Update ThinkScripts?
-------------------------------------

#### Downloading the script(s)

Enumerated below are a few ways to obtain these scripts:

1. Clone this project in the following ways:
   1. Click on the `Clone in Desktop` link located on the right sidebar on GitHub
   2. Run `git clone https://github.com/dranem05/thinkscripts-pub.git` locally
2. Download an untracked version of these files:
   1. Click on the `Download ZIP` link located on the right sidebar on GitHub
   2. Unzip the dowloaded archive to a local directory
3. Download a specific script:
   1. Navigate to the file on GitHub
   2. Click on the source file
   3. Click on `Raw` to download the file
   
#### Installing

1. Download this project into a local directory
2. Fire up TOS
3. Open up a chart
4. Click on the `analysis tools` icon (looks like something dripping)
5. Click on `edit studies`
6. Click on `import` on the bottom of the left panel
7. Navigate to the thinkscripts directory where you dowloaded this project  
   _It should be somewhere like: `path/to/download/thinkscripts-pub.git/thinkscipts/`_
8. Select the desired study and click open (or just double click the desired study)

The script should now be available in your TOS database.

#### Updating

1. Get the latest version of the script  
   _run `git pull origin` if you created a local clone of this project_
2. Fire up TOS
3. Open up a chart
4. Click on the `analysis tools` icon (looks like something dripping)
5. Click on `edit studies`
6. Click on `import` on the bottom of the left panel
7. Navigate to the thinkscripts directory where you dowloaded this project  
   _It should be somewhere like: `path/to/download/thinkscripts-pub.git/thinkscipts/`_
8. Select the desired study and click open (or just double click the desired study)
9. You will be asked if you really want to replace the study in TOS
10. Click on `Yes`

Note, that the "latest version of the script" could be local edits you
made in your local copy of the file outside of TOS. The same steps above
allow you to update the TOS version of the script.

#### Exporting Changes Made via TOS's ThinkScript Editor

If you edit the thinkscripts via TOS, you can export these edits to your local
copy of this project.

1. Navigate to the script via the `edit studies` window
2. Click on `export`
3. You will be asked where you would like the study to be exported
4. Export to your local directory of thinkscripts
5. Confirm your desire to overwrite the local copy with this new copy

If your local thinkscripts directory is a git clone location, you can 
use it to maintain your own version controlled copy of the scripts.

#### Using/Referencing in Custom Quotes and Scan Queries

1. Navigate to the `Condition Wizard` tab
   1. *For Custom Quotes*
      1. Follow the instructions in the "How Do I Install/Update 
         Custom Quote Scripts" section up to the step just prior
         to clicking on the `thinksScript Editor` tab.
      2. Click on the `Condition Wizard` tab.
   2. *For Scan Query Criteria*
      1. Click on the `Scan` tab
      2. Click on `Add Study Filter`
      3. Click on the study selector widget
      4. Click on the `Custom...` option
2. Click on `Edit` or `Add Condition`
3. Click on the study selector widget
4. Click on the `Study` option
5. Search for the desired study
6. Update input parameters if applicable
7. Select which plot to use as the scripts _value_
8. Select your comparison operator, etc.

**IMPORTANT:** 

Once referenced, TOS essentially creates an exact copy of the referenced 
script and uses this copy. Thus any changes made to the original *DOES NOT
PROPAGATE* to the custom script. You have to re-reference the script
to propagate any changes that were made to the original.

How Do I Install/Update Custom Quote Scripts?
---------------------------------------------

Downloading and getting the latest updates from this GitHub repository
are the same as with the regular ThinkScripts. Installing/Updating into
TOS is a bit  different.

#### Installing

1. Right click on a column name in a watchlist type of widget  
   _(or nearly anything that looks like a table with columns)_
2. Click on `Customize`
3. Under the `Available Items` left side panel, search for `custom`
4. Click on the scroll icon that appears to the left of any `custom` item
5. Click on the `thinkScript Editor` tab in the window that appears
6. Copy and paste the custom quote script into this window
7. Rename the script from `Custom` to whatever you like
8. Click on `OK`

#### Updating

1. Get the latest version of the script
2. Right click on a column name in a watchlist type of widget  
   _(or nearly anything that looks like a table with columns)_
3. Click on `Customize`
4. Under the `Available Items` left side panel, search for the desired script
5. Click on the scroll icon that appears to the left of that script
6. Click on the `thinkScript Editor` tab in the window that appears
7. Copy and paste the updated code into the thinkScript Editor
8. Click on `OK`

License
-------
Code is under the [MIT license][license].

[license]:https://github.com/dranem05/thinkscripts-pub/blob/master/LICENSE
[fundamental data]:http://tlc.thinkorswim.com/center/charting/thinkscript/reference/Constants/FundamentalType/index
[agg_per]:http://tlc.thinkorswim.com/center/charting/thinkscript/reference/Constants/AggregationPeriod/index 
