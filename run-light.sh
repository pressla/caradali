#!/bin/sh
#
/etc/init.d/firewall stop
cnode="node --stack_size=1024 --max_old_space_size=20 --max_new_space_size=2048 --max_executable_size=5 --gc_global --gc_interval=100 "
export cnode
while [ 1 ]; do
$cnode m2m-lightcontrol.js
sleep 10
done