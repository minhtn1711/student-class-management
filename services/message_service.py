import json
import logging

from .env_service import setting


_logger = logging.getLogger(__name__)


def publish_event(event, payload):
    try:
        import pika
    except ImportError:
        _logger.warning("PyPI package pika is not installed; skip RabbitMQ event %s", event)
        return False

    host = setting("RABBITMQ_HOST", "127.0.0.1")
    port = int(setting("RABBITMQ_PORT", "5672"))
    user = setting("RABBITMQ_USER", "student_user")
    password = setting("RABBITMQ_PASSWORD", "student_password")
    exchange = setting("RABBITMQ_EXCHANGE", "student_class_events")

    try:
        credentials = pika.PlainCredentials(user, password)
        parameters = pika.ConnectionParameters(
            host=host,
            port=port,
            credentials=credentials,
            connection_attempts=1,
            socket_timeout=3,
            blocked_connection_timeout=3,
        )
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.exchange_declare(exchange=exchange, exchange_type="topic", durable=True)
        channel.basic_publish(
            exchange=exchange,
            routing_key=event,
            body=json.dumps({"event": event, "payload": payload}, ensure_ascii=False, default=str),
            properties=pika.BasicProperties(content_type="application/json", delivery_mode=2),
        )
        connection.close()
        return True
    except Exception:
        _logger.exception("Cannot publish RabbitMQ event %s", event)
        return False
