import requests
from typing import Optional, Dict, Any
from bs4 import BeautifulSoup
import re
import json
from app.core.config import settings


class RusProfileService:

    def __init__(self):
        self.base_url = settings.rusprofile_base_url
        self.headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Referer": "https://yandex.ru/"
        }

    async def get_company_data(self, inn: str) -> Optional[Dict[str, Any]]:
        """Получить данные компании с RusProfile"""
        try:
            # Поиск компании по ИНН
            search_url = f"{self.base_url}/search"
            params = {"query": inn, "type": "ul"}

            # Используем requests вместо httpx для лучшей обработки редиректов
            response = requests.get(search_url, params=params, headers=self.headers, timeout=30)
            response.raise_for_status()

            # Парсим данные из ответа поиска
            company_data = self._extract_company_data(response.text)

            return {
                "source": "rusprofile",
                "inn": inn,
                "data": company_data
            }

        except Exception as e:
            print(f"Ошибка получения данных с RusProfile: {e}")
            return {
                "source": "rusprofile",
                "inn": inn,
                "error": str(e)
            }

    def _extract_okved_data(self, okved_url: str) -> Dict[str, Any]:
        """Дополнительный парсинг страницы ОКВЭД."""
        try:
            response = requests.get(okved_url, headers=self.headers, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "lxml")
            okved = {}

            # Отрасль, основной вид и регион
            for box in soup.select(".text-box"):
                subtitle = box.find("div", class_="sub-title")
                if not subtitle:
                    continue
                title = subtitle.text.strip()
                text = subtitle.next_sibling.strip() if subtitle.next_sibling else ""
                if title == "Отрасль":
                    okved["industry"] = text
                elif "Основной вид" in title:
                    okved["main_activity"] = text
                elif title == "Регион":
                    okved["region"] = text

            # Рейтинги и средняя выручка
            for nb in soup.select(".number-box"):
                title_elem = nb.find("div", class_="title")
                num_elem = nb.find("span", class_="num")
                if not title_elem or not num_elem:
                    continue

                title = title_elem.get_text(" ").strip()
                num = num_elem.text.strip()

                if "в России" in title and "Место в отрасли" in title:
                    okved["rank_russia"] = num
                    m = re.search(r"из\s*([\d\s]+)", nb.text)
                    okved["total_russia"] = m.group(1).strip() if m else ""
                elif "в регионе" in title:
                    okved["rank_region"] = num
                    m = re.search(r"из\s*([\d\s]+)", nb.text)
                    okved["total_region"] = m.group(1).strip() if m else ""
                elif "Средняя выручка" in title:
                    okved["average_revenue"] = f"{num} млн руб."

            # Топ-5 компаний
            tops = []
            for item in soup.select(".okved-list li.okved-item")[1:6]:
                name_tag = item.select_one(".okved-item__text .name a") \
                           or item.select_one(".okved-item__text .name")
                if name_tag:
                    tops.append(name_tag.text.strip())
            okved["top_companies"] = tops

            # Общее количество кодов и дополнительные
            header = soup.select_one(".content-frame__title")
            m = re.search(r"\((\d+)\)", header.text) if header else None
            total = int(m.group(1)) if m else 0
            okved["total_codes"] = total
            okved["additional_codes"] = max(0, total - 1)

            return okved
        except Exception as e:
            print(f"Ошибка парсинга ОКВЭД: {e}")
            return {}

    def _extract_company_data(self, html: str) -> Dict[str, Any]:
        """Парсит HTML и извлекает данные о компании"""
        soup = BeautifulSoup(html, "lxml")
        data = {}

        try:
            # Основные сведения
            h1_tag = soup.find("h1", itemprop="name")
            data["company_name"] = h1_tag.text.strip() if h1_tag else ""

            tag = soup.find("span", id="clip_name-long")
            data["full_name"] = tag.text.strip() if tag else ""

            tag = soup.find("span", id="clip_ogrn")
            data["ogrn"] = tag.text.strip() if tag else ""

            tag = soup.find("span", id="clip_inn")
            data["inn"] = tag.text.strip() if tag else ""

            tag = soup.find("span", id="clip_kpp")
            data["kpp"] = tag.text.strip() if tag else ""

            tag = soup.find("dd", itemprop="foundingDate")
            data["registration_date"] = tag.text.strip() if tag else ""

            cap = soup.find("dt", string="Уставный капитал")
            data["authorized_capital"] = cap.find_next("dd").text.strip() if cap else ""

            sts = soup.find("span", class_="company-header__icon success") \
                  or soup.find("span", class_="company-header__icon danger")
            data["status"] = sts.text.strip() if sts else ""

            tag = soup.find("span", id="clip_address")
            data["legal_address"] = tag.text.strip() if tag else ""

            # Руководитель
            dir_ = soup.find("a", href=re.compile(r"^/person/"))
            data["director"] = dir_.text.strip() if dir_ else ""

            # Коды статистики
            for code in ("okpo", "okato", "oktmo", "okfs", "okogu", "okopf"):
                tag = soup.find("span", id=f"clip_{code}")
                data[code] = tag.text.strip() if tag else ""

            # Учредитель и связи
            founder = soup.select_one(".tile-item.founders-tile .founder-item__title a")
            data["founder"] = founder.text.strip() if founder else ""

            tag = soup.find("a", class_="num gtm_c_all")
            data["total_connections"] = tag.text.strip() if tag else ""

            tag = soup.find("a", class_="num gtm_c_1")
            data["connections_by_address"] = tag.text.strip() if tag else ""

            tag = soup.find("a", class_="num gtm_c_2")
            data["connections_by_director"] = tag.text.strip() if tag else ""

            tag = soup.find("a", class_="num gtm_c_3")
            data["connections_by_founder"] = tag.text.strip() if tag else ""

            # Госзакупки
            gz = soup.find("div", class_="tile-item tab-parent gz-tile")
            if gz:
                dl = gz.find("dl", class_="founder-item__dl")
                if dl:
                    dt_tag = dl.find("dt")
                    dd_tag = dl.find("dd")
                    data["government_contracts_count"] = dt_tag.text.strip() if dt_tag else ""
                    data["government_contracts_sum"] = dd_tag.text.strip() if dd_tag else ""
                cont = gz.select_one(".founder-item__title a")
                data["main_contractor"] = cont.text.strip() if cont else ""

            # Арбитраж
            arb = soup.find("div", class_="tile-item tab-parent arbitr-tile")
            if arb:
                num_elem = arb.find("div", class_="connexion-col__num tosmall")
                if num_elem:
                    txt = num_elem.get_text(" ")
                    m1 = re.search(r"(\d+)\s*дел", txt)
                    m2 = re.search(r"на сумму\s*([\d\s]+(?:млн)?\s*руб)", txt)
                    data["arbitration_cases"] = f"{m1.group(1)} дела" if m1 else ""
                    data["arbitration_sum"] = m2.group(1) if m2 else ""

            # Налоги и взносы (2023)
            taxes_tile = soup.find("div", class_="tile-item taxes-tile")
            if taxes_tile:
                for col in taxes_tile.select(".connexion-col"):
                    title_elem = col.find("div", class_="connexion-col__title")
                    num_elem = col.find("div", class_="connexion-col__num tosmall")
                    if title_elem and num_elem:
                        title = title_elem.text.strip().lower()
                        num = num_elem.text.strip()
                        if "налоги" in title:
                            data["taxes_2023"] = num
                        if "взносы" in title:
                            data["contributions_2023"] = num

            # ОКВЭД информация
            okved_link = soup.find("a", href=re.compile(r"^/okved/"))
            if okved_link:
                okved_url = self.base_url + okved_link["href"]
                data["okved_url"] = okved_url
                # Получаем дополнительную информацию по ОКВЭД
                okved_data = self._extract_okved_data(okved_url)
                data["okved"] = okved_data

            return data

        except Exception as e:
            print(f"Ошибка парсинга данных компании: {e}")
            return {"parse_error": str(e)}

    def _safe_extract_text(self, element) -> Optional[str]:
        """Безопасно извлекает текст из элемента"""
        if element:
            return element.get_text(strip=True)
        return None