#!/usr/bin/env python3
import json
import os

import pika


HOST = os.environ.get("RABBITMQ_HOST", "127.0.0.1")
PORT = int(os.environ.get("RABBITMQ_PORT", "5672"))
USER = os.environ.get("RABBITMQ_USER", "student_user")
PASSWORD = os.environ.get("RABBITMQ_PASSWORD", "student_password")
EXCHANGE = os.environ.get("RABBITMQ_EXCHANGE", "student_class_events")


def main():
    credentials = pika.PlainCredentials(USER, PASSWORD)
    parameters = pika.ConnectionParameters(host=HOST, port=PORT, credentials=credentials)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)

    queue = channel.queue_declare(queue="", exclusive=True)
    queue_name = queue.method.queue
    channel.queue_bind(exchange=EXCHANGE, queue=queue_name, routing_key="#")

    print(f"Listening RabbitMQ exchange {EXCHANGE}. Press Ctrl+C to stop.")

    def on_message(ch, method, properties, body):
        try:
            message = json.loads(body.decode("utf-8"))
        except ValueError:
            message = body.decode("utf-8")
        print(f"\n[{method.routing_key}]")
        print(json.dumps(message, ensure_ascii=False, indent=2, default=str))

    channel.basic_consume(queue=queue_name, on_message_callback=on_message, auto_ack=True)
    channel.start_consuming()


if __name__ == "__main__":
    main()
