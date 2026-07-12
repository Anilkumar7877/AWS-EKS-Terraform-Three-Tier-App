# Base image
FROM nginx:alpine

# Copy static frontend assets into nginx HTML directory
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Expose port
EXPOSE 80

# Command to run Nginx (inherited by default from base image)
CMD ["nginx", "-g", "daemon off;"]
