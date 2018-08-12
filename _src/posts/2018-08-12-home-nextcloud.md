    Title: Setting up a home cloud server with Nextcloud
    Date: 2018-08-12T11:32:37
    Tags: linux, networking

This weekend, I set up a home server for my parents running Nextcloud so that they can have their own, (almost) free cloud storage.
The process was surprisingly simple and fun, though there are a number of steps involved, so I'm documenting it here for the sake of reproducibility.

<!-- more -->

All I needed to do this was:
1.  A computer to run as a server. Any kind of computer works &#x2013; I used an old macbook pro.
2.  Administrative access to my router.

<br></br><br></br>

# Basic setup for a local cloud with remote accessibility

## Three virtual machines

I set this up using three virtual machines each acting as an independent server with a single task.
Note that only two VMs are actually necessary to have a working setup; the third serves as an openvpn server so that I can manage the other two servers remotely as if I were on the LAN.
If you're trying to set something like this up yourself and don't want or need that, just skip everything about the openvpn server.

I set up all three VMs to run in Virtualbox.
I used Virtualbox to run the VMs because it's easy to use and runs on a mac without hassle.
Just download and install virtualbox from their website, and also download an image (`.iso`) of ubuntu server.
Once virtualbox is up and running, create three new VMs.
The first will act as a reverse proxy and the second as a vpn server.
When prompted about the virtual disk for these, pick dynamically sized with a max of 8GB.
The last VM will be the nextcloud server, so make its virtual disk dynamic with a max as big as reasonable; I used nearly all of the remaining space on the macbook's 1TB SSD, leaving 20GB or so so the macOS doesn't run into any issues if it fills up.

After performing the initial setup of the VMs, go into the settings of each one and change their network adaptor mode to "bridged".
The relevant option will be under "Networking" in the VM settings.
Doing this will make each of the VMs visible on the local network as independent hosts.

## Nextcloud server setup

Then, start up the nextcloud server and select the ubuntu server image when prompted for a startup disk.
This will load up the ubuntu live CD and go through the installation steps.
The only extra step to do during the installation is to select the nextcloud snap when prompted with commonly installed snaps.
After the installation is finished, nextcloud is pretty much done and ready to use on the LAN!
To try it out, log in to the machine and find out its ip with `ifconfig`.
Go to that ip in a web browser and you should be greeted with a nextcloud welcome page prompting you to set up an administrator account.
You might as well do that while you're there.

## Reverse proxy server setup

Next, start up the reverse proxy server and go through the motions of installing ubuntu server, this time <span class="underline">not</span> selecting any snaps when prompted.
Once logged in, install `nginx` if necessary (it was already installed on my image).
Then, find the ip of this server with `ifconfig` and take a note of it (I'll refer to it as `nginx-ip`, and the ip of the nextcloud server as `nextcloud-ip`).
Then, make a file at `/etc/nginx/sites-available/nextcloud.conf` and fill it as follows; don't forget to replace the <&#x2026;>'s with their real values!

    sudo vi /etc/nginx/sites-available/nextcloud.conf

    server {
    # The IP that you forwarded in your router (nginx proxy)
      listen <nginx-ip>:80 default_server;
    
    # The internal IP of the VM that hosts your Apache config
    # set $upstream <nginx-ip>;
    location / {
            proxy_headers_hash_max_size 512;
            proxy_headers_hash_bucket_size 64;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            add_header Front-End-Https on;
            # whatever the IP of your cloud server is
            proxy_pass http://<nextcloud-ip>;
            }
    }

Then symlink that config to `/etc/nginx/sites-enabled/` and restart nginx:

    sudo ln -s /etc/nginx/sites-available/nextcloud.conf /etc/nginx/sites-enabled/
    sudo service nginx restart

And now accessing the nginx server's ip should redirect to the nextcloud server.
Try it out (again) by going to the nginx server's ip in a web browser.

**Resource** [This guide](https://www.techandme.se/set-up-nginx-reverse-proxy/) helped me construct the config to get this working.

## Openvpn server setup

Lastly, boot up the final remaining VM and install ubuntu in the same way as the last one (the reverse proxy server).
Once logged in, just follow the [this long but easy tutorial](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-openvpn-server-on-ubuntu-16-04) to set up openvpn.
Note that that tutorial assumes you are using bash (which matters when setting up environment variables).

The only caveat to note while completing the tutorial is that before doing step 11 you should generate a key for accessing the vpn.

    cd ~/openvpn-ca
    source ./vars
    ./build-key linux-client

(hit enter through all the prompts, then 'y' to complete).

For step 12, just scp the config to your own computer, and then you can connect to the server through the vpn with

    sudo openvpn --config linux-client.ovpn

### Making the vpn accessible from the internet

The vpn is only really useful if it can be reached from the internet, so port forwarding needs to be set up in the router to forward internet traffic to the vpn server.
To do this, just configure the router to forward UDP traffic on port 1194 to the openvpn server's ip address.
Note that this only really makes sense if the openvpn server has a static ip, as described in the next section.
Furthermore, because ISP's regularly change the public IP of normal routers, it probably also makes sense to set up dynamic dns to access the vpn.

## Setting static ips for the VMs

Now, go into your router's management page and set static ips for each of the three VMs.
I just used their current ips for simplicity; otherwise, the reverse proxy nginx config would need to be updated with the new ips.
Restart the router and check that all the VMs have the assigned ips, and that they will never expire.

## Local cloud with remote accessibility

This is all that needs to be done to have nextcloud accessible on the LAN (via an ip address) as well as remotely when connected to the vpn.

To make the server more easily accessible, however, it can be exposed to the internet so that the nextcloud can be reached from anywhere in the world.
The following steps detail how to do that.

<br></br><br></br>

# Exposing the server to the internet

Exposing the nextcloud server to the internet makes it much more convenient.
For example, with a domain name it can be made accessible through a url instead of an ip address.

There are a few steps involved in making this happen:
1.  Forwarding internet traffic from the router to the server
2.  Setting up dynamic dns
3.  Setting up ssl encryption

## Port forwarding

Back in the router's settings, configure port forwarding as follows:
1.  Forward traffic of any kind on port 80 to the nginx server.
2.  Forward TCP traffic on port 443 to the nginx server.

Restart the router and now navigating to your public ip (find it with [whatismyip](https://www.whatismyip.com/)) should take you to the nextcloud.

## Dynamic DNS

Setting up dynamic dns will make the nextcloud accessible from a url instead of a public ip, which ISPs change regularly anyway.
If you have a google domain like me, then Google provides a free dynamic dns service along with the domain; that is what I used.
Setting it up on Google's end is pretty easy following [their instructions](https://support.google.com/domains/answer/6147083?hl%3Den).
There are many dynamic dns services, such as no-ip etc, all of which will have a similar process to what I describe below.

To set up the local end that notifies the dns servers of ip changes, log in to the nginx server.
Install `ddclient`, which took me a few extra steps than expected because ubuntu server doesn't have the [universe repository](https://help.ubuntu.com/community/Repositories/Ubuntu) enabled by default in ubuntu server 18.04.
Fixing that is easy, though.
Just edit `/etc/apt/sources.list` and duplicate the line with `deb <url> bionic main`, then change the `main` in the duplicated line to `universe`.
After doing that update and `ddclient` should be available as normal:

    sudo apt update && sudo apt install ddclient

With `ddclient` installed, I set up the config as described in [Google's instructions](https://support.google.com/domains/answer/6147083?hl%3Den) using the "ddclient without Google Domains support" config.
One thing to note is that the username and password in the config should be in 'single quotes'.
Once that is done, test that the configuration works

    sudo ddclient -daemon=0 -debug -verbose -noquiet

and if all is well you should be able to go to your configured domain to access the nextcloud server!

### Adding the nextcloud's external url as a trusted proxy

Upon reaching the nextcloud server for the first time from its now-configured url, nextcloud complained that the url was not a "trusted proxy".
I clicked the button provided in the prompt, and just to be safe I also followed [the docs' instructions on adding a reverse proxy configuration](https://docs.nextcloud.com/server/9/admin_manual/configuration_server/reverse_proxy_configuration.html), adding a line to `/var/snap/nextcloud/<some number here>/nextcloud/config/config.php` containing

    "trusted_proxies"   => ['<nextcloud-ip>', '<your-domain.url>'],

## SSL encryption

The last step that should really be done if the nextcloud will be accessed over the internet is to set up SSL encryption so that the server can be accessed through HTTPS.
This will ensure that your files etc will be encrypted en route to and from the server &#x2013; though not *on* the server, which is fine since an account with a password is required to access it.

This is actually pretty easy to do thanks to [Let's Encrypt](https://letsencrypt.org/).
First, port forwarding needs to be set up on port 443 because that's the port used for ssl.
This was already done in the port forwarding section above.

The next step is to obtain ssl certificates, which is also pretty easy.
The certificates need to be set up on the nginx server, because that will be the terminal for ssl connections.
So log into the nginx server and install Let's Encrypt's certbot following [the installation instructions on the website](https://certbot.eff.org/lets-encrypt/ubuntuartful-nginx).

Before running `certbot`, however, I needed to disable the reverse proxy traffic forwarding of the nginx server.
To do this, just disable the proxy config and restart nginx before running certbot.

    sudo rm /etc/nginx/sites-enabled/nextcloud.conf
    sudo service nginx restart
    sudo certbot --nginx

Then, reinstall the proxy config

    sudo ln -s /etc/nginx/sites-available/nextcloud.conf /etc/nginx/sites-enabled/

and edit it to be like this:

    server {
    # The IP that you forwarded in your router (nginx proxy)
      listen <nginx-ip>:443 ssl ipv6only=on;
      server_name <your-domain.url>;
      listen 443 ssl; # managed by Certbot
      ssl_certificate /etc/letsencrypt/live/<your-domain.url>/fullchain.pem; # managed by Certbot
      ssl_certificate_key /etc/letsencrypt/live/<your-domain.url>/privkey.pem; # managed by Certbot
      include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
      ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
    
    
    # The internal IP of the VM that hosts your Apache config
    # set $upstream <nginx-ip>;
    location / {
            proxy_headers_hash_max_size 512;
            proxy_headers_hash_bucket_size 64;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            add_header Front-End-Https on;
            # whatever the IP of your cloud server is
            # Note that it's forwarding traffic to port 80 because the nextcloud server
            # is only set up for http (not ssl)
            proxy_pass http://<nextcloud-ip>:80;
            }
    }

Finally, restart nginx

    sudo service nginx restart

In the event that you get some mixed-content warnings from nextcloud, [this might be helpful](https://bayton.org/docs/nextcloud/nexcloud-behind-a-proxy-fixing-mixed-content-warnings-with-ssl/).

**Resource** The configuration and discussion in [this reddit post](https://www.reddit.com/r/NextCloud/comments/7qsdhj/nextcloud_with_ssl_over_reverse_proxy/), as well as the settings inserted by `certbot`, guided me toward the above working configuration.

### Setting up automatic certificate renewal

The ssl certificates expire every 90 days, but they can be easily and non-interactively renewed with 

    sudo certbot renew

So just set up a cron job to do this every other month or so.

    sudo crontab -e

Adding the line

    0 0 1 */2 * /usr/bin/certbot -q renew

Which will automatically renew the certificates at midnight on the first of every other month.
