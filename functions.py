from typing import *
import json
import csv
import re
import difflib
from collections import Counter
import math
from fuzzywuzzy import fuzz, process

class ShortName:
    def __init__(self, short_name: str):
        self.world = 0
        self.level = 0
        self.is_challenge_level = False
        self.valid = False
        
        short_name = short_name.lower()
        result = re.search(r"([0-9]{1,2})-([0-9]{1,2})([Cc]?)", short_name)
        if result is None: return
        try:
            self.world = int(result[1])
            self.level = int(result[2])
        except ValueError as e:
            return
        self.is_challenge_level = len(result[3]) > 0
        self.valid = True

    def __str__(self) -> str:
        return f"{self.world}-{self.level}{'c' if self.is_challenge_level else ''}"
    
    __repr__ = __str__

    def __eq__(self, o):
        if isinstance(o, ShortName):
            return self.world == o.world and self.level == o.level and self.is_challenge_level == o.is_challenge_level and self.valid == o.valid
        return False

pb1_levels = []
with open('pb1_levels.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        row["short_name"] = ShortName(row["short_name"])
        pb1_levels.append(row)

pb2_levels = []
with open('pb2_levels.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        row["short_name"] = ShortName(row["short_name"])
        pb2_levels.append(row)

def removeLinks(text: str) -> str:
    return re.sub(r"http\S+", "", text)

prefix_storage_path = "./prefix_toggles.json"

def load_prefix_data() -> Dict[int, bool]:
    try:
        with open(prefix_storage_path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def requires_prefix(channel_id) -> bool:
    channel_id = str(channel_id)
    return load_prefix_data().get(channel_id, False)

def toggle_prefix(channel_id) -> bool:
    channel_id = str(channel_id)
    data = load_prefix_data()
    data[channel_id] = not data.get(channel_id, False)
    with open(prefix_storage_path, "w") as f:
        json.dump(data, f)
    return data[channel_id]

def loopup_via_name(levels: list, name: str):
    name = name.lower()
    return filter(lambda level: level["name"].lower() == name, levels)

def count_identical_words(string1: str, string2: str) -> int:
    return sum(v for v in (Counter(string1.strip().split()) & Counter(string2.strip().split())).values())

def bestMatches(levels: list, query: str, amount=3, score_cutoff=85) -> List[Tuple[dict, int]]:
    """Computes best matches using fuzzywuzzy.process.extractBests
    
    If there are any perfect matches, they are the only ones that are returned.
    """
    query = query.lower()
    sorting_levels = filter(lambda level: not level["short_name"].is_challenge_level, levels)

    def processor(s, force_ascii=False):
        if isinstance(s, dict):
            s = s["name"]
        return process.default_processor(s, force_ascii=force_ascii)

    result = process.extractBests(
        query,
        sorting_levels,
        processor=processor,
        limit=amount,
        score_cutoff=score_cutoff
    )

    if len(result) > 0 and result[0][1] == 100:
        # we have some perfect matches
        result = [r for r in result if r[1] == 100]
    
    return result