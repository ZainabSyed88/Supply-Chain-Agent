from __future__ import annotations
import math
import random
from datetime import datetime, timedelta
from typing import Literal
from faker import Faker
from app.models.order import Order
from app.models.shipment import Shipment
from app.models.supplier import Supplier
from app.models.disruption import Disruption
from app.models.warehouse import Warehouse

faker = Faker()
faker.seed_instance(42)
random.seed(42)


CATEGORIES: list[Literal["Electronics", "Raw Materials", "Packaging", "Finished Goods"]] = [
    "Electronics",
    "Raw Materials",
    "Packaging",
    "Finished Goods",
]

COUNTRIES = [
    "China",
    "India",
    "Germany",
    "Netherlands",
    "United States",
    "Mexico",
    "Vietnam",
    "Poland",
    "Japan",
    "South Korea",
]

DISRUPTION_TYPES = ["weather", "strike", "port_congestion", "customs", "geopolitical"]
SEVERITY_LEVELS = ["critical", "high", "medium", "low"]
STATUS_CHOICES = ["in_transit", "delayed", "delivered", "at_risk"]
SKU_NAMES = [f"SKU-{i:03d}" for i in range(1, 21)]
WAREHOUSE_BLUEPRINTS = [
    ("WH-001", "New Jersey Fulfillment Hub", "North America East", "United States"),
    ("WH-002", "Rotterdam Gateway Center", "Europe", "Netherlands"),
    ("WH-003", "Monterrey Crossdock", "North America South", "Mexico"),
    ("WH-004", "Singapore Air Freight Hub", "Asia Pacific", "Singapore"),
]


def compute_risk_score(on_time_delivery_rate: float, defect_rate: float) -> float:
    risk = 100 - (on_time_delivery_rate * 60) - ((1 - defect_rate) * 40)
    return max(0.0, min(100.0, risk))


def generate_suppliers(count: int = 25) -> list[Supplier]:
    suppliers: list[Supplier] = []
    for index in range(1, count + 1):
        on_time_delivery_rate = round(random.uniform(0.6, 1.0), 3)
        defect_rate = round(random.uniform(0.01, 0.15), 3)
        supplier = Supplier(
            supplier_id=f"SUP-{index:03d}",
            name=faker.company(),
            country=random.choice(COUNTRIES),
            category=random.choice(CATEGORIES),
            on_time_delivery_rate=on_time_delivery_rate,
            defect_rate=defect_rate,
            avg_lead_time_days=random.randint(3, 45),
            risk_score=round(compute_risk_score(on_time_delivery_rate, defect_rate), 2),
            esg_score=round(random.uniform(40.0, 95.0), 1),
            active=random.choice([True, True, True, False]),
        )
        suppliers.append(supplier)

    return suppliers


def generate_shipments(suppliers: list[Supplier], count: int = 30) -> list[Shipment]:
    shipments: list[Shipment] = []
    now = datetime.utcnow()
    for index in range(1, count + 1):
        supplier = random.choice(suppliers)
        eta = now + timedelta(days=random.randint(1, 30))
        delay_days = random.choice([0] * 18 + [1, 2, 3, 5, 7])
        status = random.choice(
            ["in_transit"] * 10
            + ["delayed"] * 6
            + ["delivered"] * 8
            + ["at_risk"] * 6
        )
        if status == "delivered":
            actual_delivery = eta - timedelta(days=random.randint(0, 3))
        elif status == "delayed":
            actual_delivery = eta + timedelta(days=delay_days)
        else:
            actual_delivery = None

        shipment = Shipment(
            shipment_id=f"SHIP-{index:04d}",
            supplier_id=supplier.supplier_id,
            origin=supplier.country,
            destination=random.choice(["United States", "Germany", "France", "Canada", "Mexico", "Japan"]),
            status=status,
            value_usd=round(random.uniform(10000, 500000), 2),
            eta=eta,
            actual_delivery=actual_delivery,
            carrier=faker.company(),
            tracking_number=faker.bothify(text="????-#####"),
            delay_days=delay_days if status in ["delayed", "at_risk"] else 0,
        )
        shipments.append(shipment)

    return shipments


def generate_disruptions(suppliers: list[Supplier], shipments: list[Shipment], count: int = 10) -> list[Disruption]:
    disruptions: list[Disruption] = []
    now = datetime.utcnow()

    for index in range(1, count + 1):
        suppliers_impacted = random.sample(suppliers, k=random.randint(1, 4))
        shipment_candidates = [s for s in shipments if s.supplier_id in {sup.supplier_id for sup in suppliers_impacted}]
        affected_shipments = random.sample(shipment_candidates, k=min(len(shipment_candidates), random.randint(1, 5)))
        severity = random.choices(SEVERITY_LEVELS, weights=[0.1, 0.2, 0.4, 0.3], k=1)[0]

        disruption = Disruption(
            disruption_id=f"DIS-{index:03d}",
            type=random.choice(DISRUPTION_TYPES),
            severity=severity,
            affected_supplier_ids=[supplier.supplier_id for supplier in suppliers_impacted],
            affected_shipment_ids=[shipment.shipment_id for shipment in affected_shipments],
            description=faker.sentence(nb_words=12),
            detected_at=now - timedelta(hours=random.randint(1, 72)),
            estimated_resolution=now + timedelta(hours=random.randint(12, 96)),
            estimated_revenue_impact_usd=round(random.uniform(100000, 1200000), 2),
        )
        disruptions.append(disruption)

    return disruptions


def generate_demand_history(days: int = 180, sku_count: int = 20) -> dict[str, list[dict[str, float]]]:
    demand_history: dict[str, list[dict[str, float]]] = {}
    now = datetime.utcnow().date()
    for sku_index in range(1, sku_count + 1):
        sku_id = f"SKU-{sku_index:03d}"
        base_demand = random.uniform(30, 120)
        daily_records: list[dict[str, float]] = []
        for day in range(days):
            date = now - timedelta(days=(days - day))
            seasonal = 1 + 0.2 * math.sin((2 * math.pi / 30) * day)
            noise = random.uniform(-5, 5)
            spike = 0
            if random.random() < 0.05:
                spike = random.uniform(20, 70)
            daily_records.append(
                {
                    "date": date.isoformat(),
                    "demand": round(max(0, base_demand * seasonal + noise + spike), 2),
                }
            )
        demand_history[sku_id] = daily_records

    return demand_history


def generate_warehouses() -> list[Warehouse]:
    warehouses: list[Warehouse] = []
    for warehouse_id, name, region, country in WAREHOUSE_BLUEPRINTS:
        utilization = round(random.uniform(0.58, 0.96), 2)
        staff_required = random.randint(45, 120)
        staff_scheduled = max(20, staff_required + random.randint(-15, 12))
        dock_capacity = random.randint(18, 42)
        throughput = random.randint(180, 680)
        if utilization >= 0.9 or staff_scheduled < staff_required:
            storage_health = "critical"
        elif utilization >= 0.8:
            storage_health = "tight"
        else:
            storage_health = "stable"

        warehouses.append(
            Warehouse(
                warehouse_id=warehouse_id,
                name=name,
                region=region,
                country=country,
                utilization_rate=utilization,
                staff_scheduled=staff_scheduled,
                staff_required=staff_required,
                pending_shipments=random.randint(8, 65),
                dock_capacity=dock_capacity,
                throughput_today=throughput,
                storage_health=storage_health,
                picking_efficiency=round(random.uniform(0.71, 0.98), 2),
            )
        )

    return warehouses


def generate_orders(
    shipments: list[Shipment],
    inventory: dict[str, int],
    warehouses: list[Warehouse],
    count: int = 36,
) -> list[Order]:
    statuses = ["pending", "allocated", "processing", "shipped", "delayed"]
    priorities = ["low", "medium", "high", "critical"]
    regions = ["North America", "Europe", "Asia Pacific", "Middle East", "Latin America"]
    orders: list[Order] = []
    now = datetime.utcnow()

    for index in range(1, count + 1):
        sku_id = random.choice(list(inventory.keys()))
        warehouse = random.choice(warehouses)
        quantity = random.randint(5, 60)
        available = inventory.get(sku_id, 0)
        priority = random.choices(priorities, weights=[0.25, 0.35, 0.25, 0.15], k=1)[0]
        status = random.choices(statuses, weights=[0.2, 0.25, 0.22, 0.2, 0.13], k=1)[0]
        linked_shipment = random.choice(shipments) if status in {"shipped", "delayed"} else None

        shortage = max(0, quantity - available)
        risk = 12 + shortage * 1.5 + (18 if status == "delayed" else 0) + (10 if priority in {"high", "critical"} else 0)

        orders.append(
            Order(
                order_id=f"ORD-{index:04d}",
                sku_id=sku_id,
                customer_name=faker.company(),
                destination_region=random.choice(regions),
                warehouse_id=warehouse.warehouse_id,
                shipment_id=linked_shipment.shipment_id if linked_shipment else None,
                status=status,
                priority=priority,
                quantity=quantity,
                inventory_available=available,
                promised_date=now + timedelta(days=random.randint(2, 18)),
                created_at=now - timedelta(days=random.randint(0, 10), hours=random.randint(0, 23)),
                fulfillment_risk=round(min(100.0, risk), 1),
            )
        )

    return orders
