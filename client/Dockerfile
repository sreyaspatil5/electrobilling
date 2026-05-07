FROM nginx:alpine

# Copy the pre-built dist folder directly into the Nginx html directory
# NOTE: You MUST run `npm run build` locally using the .env.production variables before uploading to EC2!
COPY dist /usr/share/nginx/html

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
