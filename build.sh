
rm m2mdali.tar
tar -cf m m2mdali.tar m2m-lightcontrol.js node_modules/m2m-dali/ node_modules/m2m-socket-pipe node_modules/async/
scp m2mdali.tar root@192.168.0.10:~

