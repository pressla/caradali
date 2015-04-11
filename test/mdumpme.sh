#run the meshdump tool to collect all incoming messages from connected nodes and generate a parameter settings file for this mesh
#all mac ids will be logged to mactablem2m.json and shall be stored in /etc/config/mactablem2m.json
#the file is read by m2m-dali.js to set dynamically parameters
#
# % will be replaced by blank char, so a command can be issued on command line on the node <command>~<parameter>=<value>
# myGrouping~group=<group_id> and myGrouping~name=<nodename> are special command for the switch command on LED lights

#rootnodes:
node meshdump uci%set~wireless.ap.ssid=AIMLED uci%set~wireless.radio0.channel=9 uci%set~wireless.mesh.mesh_hwmp_rootnode=3 uci%set~wireless.mesh.mesh_gate_announcements=1 uci%set~wireless.mesh.mesh_id=mesh-test myGrouping~group=G3 myGrouping~name=L1

