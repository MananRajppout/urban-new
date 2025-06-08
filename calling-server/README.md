# plivo voice ai 

```bash
ngrok http 5000
#important! update the link in plivo voice app
npm install
#start in dev mode
npm run dev

#pm2
pm2  start "npm install && npm run build && npm run start" --name voice-ai
pm2 restart voice-ai
```

### Docker

```bash
#build or rebuild the image
docker build -t plivo-voice-ai .
#run the container
docker run -p 5000:5000 plivo-voice-ai

#stop the container
docker ps # get the container id
docker stop <container_id>


```

### Other

```bash
#run example in dev mode
npx tsc-watch --onSuccess "node dist/examples/elevenlab.js"
#or
pnpm run dev:ex "node dist/examples/tts.js"

#log to file
npx tsc-watch --onSuccess "node dist/examples/elevenlab.js" 2>&1 > temp/log.txt


#tunnel
ngrok http --url=cat-deep-absolutely.ngrok-free.app 3000
devtunnel host -p 8080 --allow-anonymous
devtunnel host -p 5000 --allow-anonymous 

```
