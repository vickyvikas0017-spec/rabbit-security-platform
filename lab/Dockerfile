FROM python:3.11-alpine

WORKDIR /app

RUN echo '{"status":"active","service":"Rabbit Internal Dispatch Gateway v2.4","endpoints":["/api/v1/status","/api/v1/metrics"]}' > /app/response.json

EXPOSE 8080

CMD ["python", "-m", "http.server", "8080"]

