This directory contains Apify's custom builds of Firefox for different platforms.
The source code is available at https://github.com/apifytech/gecko-dev
in one of the `apify-xxx` branches.

The build process follows the general
[Firefox build instructions](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Build_Instructions/Simple_Firefox_build#Building).

# Mac

Clone the source code:

```
git clone https://github.com/apifytech/gecko-dev
cd gecko-dev
git checkout apify-69.0.1
```

Prepare the build environment: 

```
./mach bootstrap
```

Run the build and eventually prepare the macOS app:

```
./mach build
./mach package
```

Mount the built DMG file, zip the `Nighlty.app` directory and copy it to
`./custom_firefox/mac/firefox.mac.zip`.


# Linux 

On Linux, the build is slightly more complicated.
Apify actors are based on the [Debian Docker images](https://hub.docker.com/_/debian/)
(current version is called Stretch).
You'll need to build the Linux version in this image,
so that you have the right version of all the libraries.

Here are the steps to perform the build manually.
Give your Docker daemon enough CPUs and memory,
otherwise the build will take forever.

Build the right Docker image for the Firefox build
and run it in interactive mode.

```
docker build .
docker run -it [BUILT_IMAGE_ID] /bin/bash
```

Clone the source code:

```
git clone https://github.com/apifytech/gecko-dev
cd gecko-dev
git checkout apify-69.0.1
```

Prepare the build environment: 

```
./mach bootstrap
```

Run the build in a new shell (!!!) and eventually prepare the Linux Firefox app:

```
sh
./mach build
./mach package
```

Then transfer the built app from:
```
./gecko-dev/obj-x86_64-pc-linux-gnu/dist/firefox-69.0.1.en-US.linux-x86_64.tar.bz2
```
to local directory:
```
./custom_firefox/linux-x86_64/firefox.linux-x86_64.tar.bz2
```

For example, you can use FTP for that.









