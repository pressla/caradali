
name=m2msystemmodules.tar
rm $name
tar -cf $name m2m_param m2m_config.js m2m_socket_log.js node_modules/m2m-socket-pipe/
scp $name root@$1

