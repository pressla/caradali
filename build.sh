
rm m2mdali.tar
tar -cf m2mdali.tar run-light.sh m2m-lightcontrol.js node_modules/m2m-dali/ node_modules/m2m-socket-pipe node_modules/async/
scp m2mdali.tar root@192.168.0.10:~

