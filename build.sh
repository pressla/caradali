
rm m2mdali.tar
tar -cf m2mdali.tar build.sh run-light.sh m2m-lightcontrol.js test/ node_modules/m2m-dali/ node_modules/async/
scp m2mdali.tar root@$1:/etc/config/m2mdali

