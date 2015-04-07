#run the meshdump tool to collect all incoming messages from connected nodes and generate a parameter settings file for this mesh
#all mac ids will be logged to mactablem2m.json and shall be stored in /etc/config/mactablem2m.json
#the file is read by m2m-dali.js to set dynamically parameters
#
# % will be replaced by blank char, so a command can be issued on command line on the node <command>~<parameter>=<value>
# myGrouping~group=<group_id> and myGrouping~name=<nodename> are special command for the switch command on LED lights


node meshdump uci%set~wireless.@wifi-iface[0].ssid=AIMLED2 uci%set~wireless.@wifi-device[0].channel=1 uci%set~wireless.@wifi-iface[1].mesh_rssi_threshold=0 myGrouping~group=G1 myGrouping~name=L1