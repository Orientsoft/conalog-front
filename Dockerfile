FROM registry.orientsoft.cn/orientsoft/node:6.11.1-alpine
MAINTAINER Timothy <yexiaozhou@orientsoft.cn>

ADD entrypoint.sh /conalog/entrypoint.sh
ADD app.js /conalog/app.js
ADD gulpfile.js /conalog/gulpfile.js
ADD public /conalog/public
ADD views /conalog/views
ADD LICENSE /conalog/LICENSE
ADD bin /conalog/bin
# Should copy generated node_modules from other place
ADD node_modules /conalog/node_modules
ADD reflux-app /conalog/reflux-app

ADD README.md /conalog/README.md
ADD config /conalog/config
ADD package.json /conalog/package.json
ADD routes /conalog/routes

WORKDIR /conalog

EXPOSE 9527

CMD ["/conalog/entrypoint.sh"]
#CMD ["/bin/sh", "-c", "while true; do echo hello world; sleep 1; done"]
