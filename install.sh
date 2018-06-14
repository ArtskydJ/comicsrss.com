cd /root
git clone git@github.com:ArtskydJ/comicsrss.com.git || true
apt-get install sendmail -y
read -p "Enter your email address: " comicsrss_email_address
crontab -l > ./crontab.txt
echo "MAILTO=$comicsrss_email_address" >> ./crontab.txt
echo "# Runs at 1:15 CDT. It would work at 12:15, but I don't want to" >> ./crontab.txt
echo "# have to change it for DST. Not sure if I would have to or not..." >> ./crontab.txt
echo "15 2 * * * sh /root/comicsrss.com/_generator/generate-and-push.sh" >> ./crontab.txt
crontab ./crontab.txt
