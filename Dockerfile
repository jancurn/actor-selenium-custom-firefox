FROM apify/actor-node-chrome-xvfb

# Run everything as root
USER root

COPY ./custom_firefox/linux-x86_64/firefox.linux-x86_64.tar.bz2 /

# Firefox build needs newer version of libstdc from experimental package
RUN echo "deb http://ftp.debian.org/debian sid main" >> /etc/apt/sources.list \
  && DEBIAN_FRONTEND=noninteractive apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get -t sid install -y libc6 libstdc++6 libdbus-glib-1-2 \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y nano binutils bzip2 tar \
  && tar xjf /firefox.linux-x86_64.tar.bz2 -C /

COPY ./custom_firefox/linux-x86_64/geckodriver /firefox/

ENV PATH="/firefox:${PATH}"

WORKDIR /home/myuser

# Second, copy just package.json and package-lock.json since they are the only files
# that affect NPM install in the next step
COPY package*.json ./install_firefox.sh ./

# Install NPM packages, skip optional and development dependencies to keep the
# image small. Avoid logging too much and print the dependency tree for debugging
RUN npm --quiet set progress=false \
 && npm install --only=prod --no-optional \
 && echo "Installed NPM packages:" \
 && npm list \
 && echo "Node.js version:" \
 && node --version \
 && echo "NPM version:" \
 && npm --version

# Next, copy the remaining files and directories with the source code.
# Since we do this after NPM install, quick build will be really fast
# for simple source file changes.
COPY ./main.js /home/myuser/

ENV DISPLAY=:99
# Emulate MacBook Pro screen size
ENV XVFB_WHD=2880x1800x24
ENV APIFY_XVFB=1

# Using "npm start" to have env vars correctly setup
CMD ./start_xvfb_and_run_cmd.sh && npm start
