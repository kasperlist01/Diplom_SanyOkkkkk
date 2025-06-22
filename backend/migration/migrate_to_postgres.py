import sqlite3
import psycopg2
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DatabaseMigrator:
    def __init__(self, sqlite_path, postgres_url):
        self.sqlite_path = sqlite_path
        self.postgres_url = postgres_url
        self.sqlite_conn = None
        self.postgres_conn = None
        self.postgres_engine = None

    def connect_databases(self):
        """Подключение к базам данных"""
        try:
            # Подключение к SQLite
            self.sqlite_conn = sqlite3.connect(self.sqlite_path)
            self.sqlite_conn.row_factory = sqlite3.Row
            logger.info(f"Подключение к SQLite: {self.sqlite_path}")

            # Подключение к PostgreSQL
            self.postgres_engine = create_engine(self.postgres_url)
            self.postgres_conn = psycopg2.connect(self.postgres_url)
            self.postgres_conn.autocommit = False
            logger.info("Подключение к PostgreSQL установлено")

        except Exception as e:
            logger.error(f"Ошибка подключения к базам данных: {e}")
            raise

    def create_postgres_tables(self):
        """Создание таблиц в PostgreSQL"""
        try:
            cursor = self.postgres_conn.cursor()

            # Создание таблицы company с увеличенными размерами полей
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS company (
                    company_id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,  -- Изменено с VARCHAR(500) на TEXT
                    inn VARCHAR(20) NOT NULL UNIQUE,
                    okved VARCHAR(200),  -- Увеличено с 100 до 200
                    okved_o VARCHAR(200),  -- Увеличено с 100 до 200
                    kod_re VARCHAR(20)   -- Увеличено с 10 до 20
                );
            """)

            # Создание индексов для company
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_company_name ON company(name);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_company_inn ON company(inn);")

            # Создание таблицы report
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS report (
                    report_id SERIAL PRIMARY KEY,
                    company_id INTEGER NOT NULL REFERENCES company(company_id),
                    year INTEGER NOT NULL,
                    intangible_assets_eoy NUMERIC,
                    intangible_assets_poy NUMERIC,
                    curr_assets_eoy NUMERIC,
                    curr_assets_poy NUMERIC,
                    balance_assets_eoy NUMERIC,
                    balance_assets_poy NUMERIC,
                    retained_earnings_eoy NUMERIC,
                    retained_earnings_poy NUMERIC,
                    equity_eoy NUMERIC,
                    equity_poy NUMERIC,
                    lt_liabilities_eoy NUMERIC,
                    lt_liabilities_poy NUMERIC,
                    st_liabilities_eoy NUMERIC,
                    st_liabilities_poy NUMERIC,
                    balance_liab_eoy NUMERIC,
                    balance_liab_poy NUMERIC,
                    revenue_cur NUMERIC,
                    revenue_prev NUMERIC,
                    gross_profit_cur NUMERIC,
                    gross_profit_prev NUMERIC,
                    oper_profit_cur NUMERIC,
                    oper_profit_prev NUMERIC,
                    pbt_cur NUMERIC,
                    pbt_prev NUMERIC,
                    income_tax_cur NUMERIC,
                    income_tax_prev NUMERIC,
                    net_profit_cur NUMERIC,
                    net_profit_prev NUMERIC
                );
            """)

            # Создание индексов для report
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_report_company_id ON report(company_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_report_year ON report(year);")

            self.postgres_conn.commit()
            logger.info("Таблицы PostgreSQL созданы успешно")

        except Exception as e:
            self.postgres_conn.rollback()
            logger.error(f"Ошибка создания таблиц PostgreSQL: {e}")
            raise

    def truncate_string(self, value, max_length):
        """Обрезает строку до максимальной длины"""
        if value is None:
            return None
        if len(str(value)) > max_length:
            logger.warning(f"Обрезка значения: {str(value)[:50]}... (длина: {len(str(value))})")
            return str(value)[:max_length]
        return str(value)

    def migrate_companies(self):
        """Миграция таблицы company"""
        try:
            sqlite_cursor = self.sqlite_conn.cursor()
            postgres_cursor = self.postgres_conn.cursor()

            # Получение данных из SQLite
            sqlite_cursor.execute("SELECT * FROM company")
            companies = sqlite_cursor.fetchall()

            logger.info(f"Найдено {len(companies)} компаний для миграции")

            # Очистка таблицы PostgreSQL
            postgres_cursor.execute("TRUNCATE TABLE report, company RESTART IDENTITY CASCADE;")

            # Вставка данных в PostgreSQL
            batch_size = 1000
            for i in range(0, len(companies), batch_size):
                batch = companies[i:i+batch_size]

                insert_query = """
                    INSERT INTO company (company_id, name, inn, okved, okved_o, kod_re)
                    VALUES %s
                """

                values = []
                for company in batch:
                    # Обрабатываем длинные значения
                    name = company['name'] if company['name'] else 'Без названия'
                    inn = self.truncate_string(company['inn'], 20)
                    okved = self.truncate_string(company['okved'], 200)
                    okved_o = self.truncate_string(company['okved_o'], 200)
                    kod_re = self.truncate_string(company['kod_re'], 20)

                    values.append((
                        company['company_id'],
                        name,  # Теперь TEXT, без ограничений
                        inn,
                        okved,
                        okved_o,
                        kod_re
                    ))

                # Используем execute_values для массовой вставки
                from psycopg2.extras import execute_values
                execute_values(postgres_cursor, insert_query, values)

                logger.info(f"Перенесено компаний: {min(i+batch_size, len(companies))}/{len(companies)}")

            # Обновление последовательности
            postgres_cursor.execute("SELECT setval('company_company_id_seq', (SELECT MAX(company_id) FROM company));")

            self.postgres_conn.commit()
            logger.info("Миграция таблицы company завершена")

        except Exception as e:
            self.postgres_conn.rollback()
            logger.error(f"Ошибка миграции компаний: {e}")
            raise

    def migrate_reports(self):
        """Миграция таблицы report"""
        try:
            sqlite_cursor = self.sqlite_conn.cursor()
            postgres_cursor = self.postgres_conn.cursor()

            # Получение данных из SQLite
            sqlite_cursor.execute("SELECT * FROM report")
            reports = sqlite_cursor.fetchall()

            logger.info(f"Найдено {len(reports)} отчетов для миграции")

            if len(reports) == 0:
                logger.info("Нет отчетов для миграции")
                return

            # Вставка данных в PostgreSQL
            batch_size = 1000
            for i in range(0, len(reports), batch_size):
                batch = reports[i:i+batch_size]

                insert_query = """
                    INSERT INTO report (
                        report_id, company_id, year,
                        intangible_assets_eoy, intangible_assets_poy,
                        curr_assets_eoy, curr_assets_poy,
                        balance_assets_eoy, balance_assets_poy,
                        retained_earnings_eoy, retained_earnings_poy,
                        equity_eoy, equity_poy,
                        lt_liabilities_eoy, lt_liabilities_poy,
                        st_liabilities_eoy, st_liabilities_poy,
                        balance_liab_eoy, balance_liab_poy,
                        revenue_cur, revenue_prev,
                        gross_profit_cur, gross_profit_prev,
                        oper_profit_cur, oper_profit_prev,
                        pbt_cur, pbt_prev,
                        income_tax_cur, income_tax_prev,
                        net_profit_cur, net_profit_prev
                    ) VALUES %s
                """

                values = []
                for report in batch:
                    values.append((
                        report['report_id'], report['company_id'], report['year'],
                        report['intangible_assets_eoy'], report['intangible_assets_poy'],
                        report['curr_assets_eoy'], report['curr_assets_poy'],
                        report['balance_assets_eoy'], report['balance_assets_poy'],
                        report['retained_earnings_eoy'], report['retained_earnings_poy'],
                        report['equity_eoy'], report['equity_poy'],
                        report['lt_liabilities_eoy'], report['lt_liabilities_poy'],
                        report['st_liabilities_eoy'], report['st_liabilities_poy'],
                        report['balance_liab_eoy'], report['balance_liab_poy'],
                        report['revenue_cur'], report['revenue_prev'],
                        report['gross_profit_cur'], report['gross_profit_prev'],
                        report['oper_profit_cur'], report['oper_profit_prev'],
                        report['pbt_cur'], report['pbt_prev'],
                        report['income_tax_cur'], report['income_tax_prev'],
                        report['net_profit_cur'], report['net_profit_prev']
                    ))

                from psycopg2.extras import execute_values
                execute_values(postgres_cursor, insert_query, values)

                logger.info(f"Перенесено отчетов: {min(i+batch_size, len(reports))}/{len(reports)}")

            # Обновление последовательности
            postgres_cursor.execute("SELECT setval('report_report_id_seq', (SELECT MAX(report_id) FROM report));")

            self.postgres_conn.commit()
            logger.info("Миграция таблицы report завершена")

        except Exception as e:
            self.postgres_conn.rollback()
            logger.error(f"Ошибка миграции отчетов: {e}")
            raise

    def verify_migration(self):
        """Проверка корректности миграции"""
        try:
            sqlite_cursor = self.sqlite_conn.cursor()
            postgres_cursor = self.postgres_conn.cursor()

            # Проверка количества записей в company
            sqlite_cursor.execute("SELECT COUNT(*) FROM company")
            sqlite_company_count = sqlite_cursor.fetchone()[0]

            postgres_cursor.execute("SELECT COUNT(*) FROM company")
            postgres_company_count = postgres_cursor.fetchone()[0]

            logger.info(f"Компании - SQLite: {sqlite_company_count}, PostgreSQL: {postgres_company_count}")

            # Проверка количества записей в report
            sqlite_cursor.execute("SELECT COUNT(*) FROM report")
            sqlite_report_count = sqlite_cursor.fetchone()[0]

            postgres_cursor.execute("SELECT COUNT(*) FROM report")
            postgres_report_count = postgres_cursor.fetchone()[0]

            logger.info(f"Отчеты - SQLite: {sqlite_report_count}, PostgreSQL: {postgres_report_count}")

            # Проверка нескольких записей
            sqlite_cursor.execute("SELECT name, inn FROM company LIMIT 5")
            sqlite_sample = sqlite_cursor.fetchall()

            for company in sqlite_sample:
                postgres_cursor.execute("SELECT name FROM company WHERE inn = %s", (company['inn'],))
                postgres_company = postgres_cursor.fetchone()
                if postgres_company and postgres_company[0] == company['name']:
                    logger.info(f"✓ Компания {company['name'][:50]}... ({company['inn']}) перенесена корректно")
                else:
                    logger.error(f"✗ Ошибка переноса компании {company['name'][:50]}... ({company['inn']})")

            # Проверка самых длинных названий
            postgres_cursor.execute("SELECT name, LENGTH(name) as len FROM company ORDER BY LENGTH(name) DESC LIMIT 3")
            longest_names = postgres_cursor.fetchall()
            logger.info("Самые длинные названия компаний:")
            for name, length in longest_names:
                logger.info(f"  Длина {length}: {name[:100]}...")

            return (sqlite_company_count == postgres_company_count and
                    sqlite_report_count == postgres_report_count)

        except Exception as e:
            logger.error(f"Ошибка проверки миграции: {e}")
            return False

    def close_connections(self):
        """Закрытие соединений"""
        if self.sqlite_conn:
            self.sqlite_conn.close()
        if self.postgres_conn:
            self.postgres_conn.close()
        if self.postgres_engine:
            self.postgres_engine.dispose()

    def migrate(self):
        """Основной метод миграции"""
        try:
            logger.info("Начало миграции данных")

            self.connect_databases()
            self.create_postgres_tables()
            self.migrate_companies()
            self.migrate_reports()

            if self.verify_migration():
                logger.info("✓ Миграция завершена успешно!")
                return True
            else:
                logger.error("✗ Миграция завершена с ошибками")
                return False

        except Exception as e:
            logger.error(f"Критическая ошибка миграции: {e}")
            return False
        finally:
            self.close_connections()

def main():
    # Параметры по умолчанию
    sqlite_path = os.getenv('SQLITE_PATH', './data/finance.db')
    postgres_url = os.getenv('POSTGRES_URL', 'postgresql://company_user:company_password@localhost:5432/company_analytics')

    # Проверка существования SQLite файла
    if not os.path.exists(sqlite_path):
        logger.error(f"SQLite файл не найден: {sqlite_path}")
        sys.exit(1)

    logger.info(f"SQLite: {sqlite_path}")
    logger.info(f"PostgreSQL: {postgres_url}")

    # Запуск миграции
    migrator = DatabaseMigrator(sqlite_path, postgres_url)
    success = migrator.migrate()

    if success:
        logger.info("Миграция успешно завершена!")
        sys.exit(0)
    else:
        logger.error("Миграция завершена с ошибками!")
        sys.exit(1)

if __name__ == "__main__":
    main()