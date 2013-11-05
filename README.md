PM ThinkScripts
===============
This is a collection of handy thinkscripts for use on the thinkorswim (TOS)
trading platform.

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

License
-------
Code is under the [MIT license][license].

[license]:https://github.com/dranem05/thinkscripts-pub/blob/master/LICENSE
[fundamental data]:http://tlc.thinkorswim.com/center/charting/thinkscript/reference/Constants/FundamentalType/index
[agg_per]:http://tlc.thinkorswim.com/center/charting/thinkscript/reference/Constants/AggregationPeriod/index 
