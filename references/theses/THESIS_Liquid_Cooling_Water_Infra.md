
# Liquid Cooling & Water Infrastructure 2026


> **💧** 

    **สรุปสั้น:** Liquid cooling เป็น picks-and-shovels play ที่จำเป็นต่อ AI infrastructure boom — ตลาดมูลค่า $4-7B ในปี 2026 โตเป็น $27-30B ภายในปี 2033-2035 (CAGR 18-32% แล้วแต่สำนัก) ขับเคลื่อนโดยความหนาแน่นของแร็คที่พุ่งจาก 16kW (2025) → 27kW (2026) → 600kW (Rubin Ultra, 2027) มีมิติเสริมที่สำคัญคือแรงกดดันเรื่องน้ำ ซึ่งทำให้เทคโนโลยี waterless มีมูลค่าเชิงกลยุทธ์เพิ่มขึ้น

    ⚠️ เอกสารนี้เป็นข้อมูลประกอบการตัดสินใจ ไม่ใช่คำแนะนำทางการเงิน ควรตรวจสอบข้อมูลล่าสุดก่อนตัดสินใจลงทุนจริง


# 1. ขนาดตลาดและอัตราการเติบโต

| คาดการณ์ | แหล่งข้อมูล | มูลค่าปีฐาน 2025/26 | CAGR |
| $27.1B by 2035 | Global Market Insights | $6.0B (2026) | 18.2% |
| $27.65B by 2033 | MarketsandMarkets | $4.07B (2026) | 31.5% |
| $29.2B by 2033 | Persistence Market Research | $5.7B (2026) | 26.4% |
| $18.79B by 2031 | Mordor Intelligence | $6.77B (2026) | 22.65% |
| $14.95B by 2032 | Research and Markets | $6.3B (2026) | 15.4% |
| $25.80B by 2035 | Precedence Research | $5.58B (2026) | 18.61% |
| +$2.48B growth 2026-30 | Technavio (AI-specific) | - | 31.7% |

> **💡** 

    ตัวเลขจากแต่ละสำนักต่างกันมาก แต่ทิศทางเหมือนกันทั้งหมด: โตเร็วกว่า GDP โลกหลายสิบเท่า ขับเคลื่อนโดยการเปลี่ยนผ่านจาก air cooling เป็น liquid cooling แบบบังคับเนื่องจากข้อจำกัดทางฟิสิกส์ของ air cooling


---


# 2. ประเภทของ Liquid Cooling

  เป็น spectrum ตั้งแต่ผสมกับแอร์เดิม ไปจนถึงแทนที่แอร์ทั้งหมด

| แบบ | ความหนาแน่นที่รองรับ | สัมผัสชิป? | หลักการทำงาน | เหมาะกับ |
| Rear-Door Heat Exchanger (RDHx) | ต่ำ-กลาง | ไม่ | แทนที่ประตูแร็คด้วย coil ระบายความร้อนด้วยการดูดซับอากาศเสีย | Retrofit ดาต้าเซ็นต์เก่า |
| Direct-to-Chip (D2C) Cold Plate | 40-120+ kW | ใช่ | แผ่นเย็นติดตรง CPU/GPU ดูดความร้อนโดยตรง | New build ส่วนใหญ่ตอนนี้ |
| Immersion — Single-phase | สูงมาก | ใช่ | แช่เซิร์ฟเวอร์ทั้งตัวในอ่าง dielectric fluid | Colocation จำกัดพื้นที่ |
| Immersion — Two-phase | สูงสุด | ใช่ | อองค์เหลวเดือดดูดความร้อน แล้วควบแน่นกลับ | GPU cluster หนาแน่นสุดขั้ว |
  D2C คือสถาปัตยกรรมที่ครองตลาด new build ตอนนี้[[1]](https://alliancechemical.com/blogs/articles/direct-to-chip-vs-immersion-cooling-fluid-types) แต่ immersion เป็นประเภทที่โตเร็วที่สุดในเชิงเทคโนโลยี CAGR 34.1%[[2]](https://www.marketsandmarkets.com/Market-Reports/data-center-liquid-cooling-market-84374345.html)


---


# 3. Value Chain


### ต้นน้ำ

  **1. ผู้ผลิตชิป** — NVIDIA, AMD, Intel กำหนด TDP ที่สร้างความต้องการ cooling

  **2. ผู้ผลิต cold plate/heat exchanger** — Boyd, CoolIT, ZutaCore, Accelsius

  **3. ผู้ผลิต CDU (Coolant Distribution Unit)** — หัวใจของระบบ — Vertiv Liebert, nVent, Motivair (Schneider)


### ปลายน้ำ

  **4. ผู้ผลิตสารหล่อเย็น/ท่อ/manifold** — dielectric fluid, สารเคมีป้องการกัดกร่อน

  **5. ผู้ผสาน/ODM** — Wiwynn, Quanta, Supermicro ที่ประกอบเข้ากับแร็ค

  **6. ระบบน้ำระดับอาคาร/เทศบาล** — Xylem, เทศบาลท้องถิ่นที่จ่าย makeup water


---


# 4. ลูกค้าหลัก และความต้องการ

  **สัดส่วนตลาดตามกลุ่มลูกค้า:**

| CAGR | ลักษณะงาน | ส่วนแบ่งตลาด | กลุ่ม |
| สูงสุด | GPU cluster 60-100+ kW/rack สำหรับ training LLM | 76.4% | Hyperscale (AWS, Azure, GCP, Oracle, Alibaba) |
| 16%+ | สำหรับ private AI cluster | ~45% | Enterprise |
| 33.9% (สูงสุด) | Edge, retrofit | - | Small & Medium DC |
| - | จำกัดพื้นที่ ต้องเพิ่มความหนาแน่น | - | Colocation |
  **สิ่งที่ลูกค้าต้องการ:**

  1. **รองรับความหนาแน่นที่พุ่งเร็ว** — ความหนาแน่นเฉลี่ยกระโดดจาก ~16kW (2025) เป็น 27kW (2026) โดยมีเพียง 1 ใน 5 ของผู้ให้บริการที่พร้อมรองรับแร็ค 50-70kW[[3]](https://blog.se.com/datacenter/2026/07/28/data-center-power-density-planning-liquid-cooled-ai-data-centers-around-grid-and-power-constraints/)
  1. **ความเร็วในการติดตั้ง** — เหตุเพราะ permit ไฟฟ้าใหม่ใช้เวลา 3-4 ปี นานกว่าการสร้างอาคารเอง[[3]](https://blog.se.com/datacenter/2026/07/28/data-center-power-density-planning-liquid-cooled-ai-data-centers-around-grid-and-power-constraints/)
  1. **Retrofit ได้** — ดาต้าเซ็นต์เก่าจำนวนมากยังใช้แอร์ ต้องการโซลูชันที่เพิ่มได้โดยไม่รื้อทั้งหมด
  1. **Payback ที่จับต้องได้** — การลงทุน immersion 1MW อยู่ที่ $2.5-3.5M แพงกว่า air cooling ประมาณ 2 เท่า แต่คืนทุนได้ภายใน 3 ปีที่ความหนาแน่นเกิน 30kW[[4]](https://www.adamsilvaconsulting.com/insights/data-center-cooling-economics-2026)

---


# 5. แนวโน้มความต้องการอนาคต


> **📈** 

    **เส้นทางความหนาแน่นแร็ค (kW/rack):**

    H100 (2023): 12kW → Blackwell B200 (2026): 27kW → GB200 NVL72: 120-140kW → **Rubin Ultra NVL576 (2027 est.): ~600kW**[[4]](https://www.adamsilvaconsulting.com/insights/data-center-cooling-economics-2026)

    ณ จุดนี้ "kW ต่อแร็ค" จะกลายเป็นตัวชี้วัดรอง สิ่งที่สำคัญจริงคือ compute ต่อตารางฟุตและ token ต่อวัตต์ — โอเปอเรเตอร์กำลังหมดพื้นที่ระบายความร้อนก่อนจะหมดพื้นที่พื้นอาคารเสียอีก[[4]](https://www.adamsilvaconsulting.com/insights/data-center-cooling-economics-2026)

  **ประเด็นสำคัญอื่นๆ:**

  - **Inference แซง training** — inference ที่ทำงานต่อเนื่อง 24 ชม. คิดเป็น 80-90% ของ compute AI ทั้งหมด — ความต้องการ cooling จะสม่ำเสมอตลอดเวลา ไม่ใช่แค่ช่วง peak training[[5]](https://techplustrends.com/ai-data-center-power-requirements-2026-guide/)
  - **D2C เป็นข้อบังคับ ไม่ใช่ทางเลือก** — สำหรับชิปรุ่นใหม่อย่าง GB200 NVL72 เพราะอากาศระบายความร้อน 140kW ต่อแร็คไม่ไหว[[5]](https://techplustrends.com/ai-data-center-power-requirements-2026-guide/)
  - **Waterless technology** — แรงกดดันเรื่องน้ำจะหนุนเทคโนโลยี two-phase ที่ไม่ใช้น้ำเลยให้มีมูลค่าเชิงกลยุทธ์เพิ่มขึ้น

---


# 6. แรงกดดันด้านน้ำ (Water Angle)


> **🚨** 

    Congressional Research Service (ก.ค. 2026): ดาต้าเซ็นต์สหรัฐฏ ใช้น้ำโดยตรง~17,400ล้านแกลลอนในปี 2023 (3เท่าจากปี 2014) + ใช้น้ำทางอ้อมผ่านการผลิตไฟฟ้า 211,000 ล้านแกลลอน (12เท่าของการใช้โดยตรง แต่แทบไม่เคยเปิดเผยในรายงานความยั่งยืน)[[6]](https://www.theglobalstatistics.com/data-center-water-usage-statistics-in-us/)

  แรงเสียดทานทางสังคม/กฎหมายเป็นจริง: โครงการมูลค่ารวม $64,000 ล้านดอลลาร์ถูกชะลอ/บล็อกเพราะการต่อต้านจากชุมชนท้องถิ่นเรื่องเสียง พลังงาน และการแย่งน้ำ[[7]](https://www.akcp.com/2026/08/17/truth-about-data-water-footprint-of-data-centers/) — นี่คือเหตุผลหลักที่ทำให้เทคโนโลยี waterless มีมูลค่าเชิงกลยุทธ์เพิ่มขึ้นเรื่อยๆ


---


# 7. ชั้นมูลค่า—ผู้เล่นหลักและ Potential Growth Players


## 7.1 บริษัทมหาชน / กึ่ง pure-play

| Ticker | บริษัท | จุดเด่น |
| VRT | Vertiv | Pure-play หลัก — 75% รายได้จากดาต้าเซ็นต์ backlog +109% YoY จับมือ Nvidia/Intel โดยตรง |
| NVT | nVent Electric | ~40% ยอดขายมาจาก AI แล้ว เน้น electrical protection + cooling |
| MOD | Modine Manufacturing | เล็กกว่าแต่โตเร็ว — DC sales +78% YoY |
| ETN | Eaton | ซื้อ Boyd Thermal มี.ค. 2026 — คาดรายได้~$1.7B ในปี 2026 |
| SBGSF | Schneider Electric | รายใหญ่ที่สุดโดยรายได้ เข้าถือโดยตรงยากสำหรับ US retail |
| XYL | Xylem | Water infra pure-play — เชื่อมกับ AI ทางอ้อม ผ่าน semiconductor/power/water reuse |

## 7.2 กระแส M&A — สัญญาณว่าตลาด "ถูกยืนยัน" แล้ว

| ดีล | ผู้ซื้อ | มูลค่า/หมายเหตุ |
| CoolIT Systems | Ecolab (จาก KKR) | 29x forward EBITDA — KKR ทำกำไร 15 เท่า ปิดดีล Q3 2026 |
| LiquidStack | Trane Technologies | ปิดดีล มี.ค. 2026 |
| JetCool | Flex | พ.ย. 2024 |
| Chilldyne | Daikin | พ.ย. 2025 |
| GRC | Vertiv | เสริม portfolio immersion |

## 7.3 สตาร์ทอัพอิสระที่เหลือ (ทางเลือก acquisition target / growth play)

| บริษัท | เทคโนโลยี | สถานะล่าสุด |
| ZutaCore | Two-phase waterless D2C | Series C $100M+ จาก Mitsubishi Electric, Carrier, Samsung Ventures — valuation ~$600M |
| Submer | Immersion cooling | Series C เน้นลดน้ำ/พลังงาน |
| Iceotope | Precision liquid (dielectric) | ยังอิสระ |
| Accelsius | Two-phase D2C | คู่แข่งตรงของ ZutaCore |
| Corintis | Microfluidic (ใกล้ชิปที่สุด) | เทคโนโลยีแนวหน้าสุด |

---


# 8. Investment Thesis สรุป


<details><summary>📈 Bull case</summary>

    - ตลาดโตเร็วจริง (CAGR 18-32%) จากการเปลี่ยนผ่านบังคับจาก air cooling ที่ทำไม่ไหวแล้ว
    - Backlog ของผู้เล่นหลักยืนยันด้วยตัวเลขจริง (Vertiv +109% YoY)
    - M&A premium สูง (29x EBITDA) ยืนยันว่า strategic buyer เชื่อ thesis นี้จริง
    - Rack density จะพุ่งต่อเนื่อง (Rubin Ultra ~600kW) ทำให้ liquid cooling เป็นข้อบังคับมากขึ้นเรื่อยๆ
    - แรงกดดันเรื่องน้ำสร้างมูลค่าเพิ่มให้เทคโนโลยี waterless (ZutaCore และกลุ่ม two-phase)

</details>


<details><summary>📉 Bear case / ความเสี่ยง</summary>

    - Valuation ตึงแล้ว — Vertiv โต 3เท่าо12เดือน Modine โต 2เท่า ไม่ใช่ชื่อราคาถูกอีกต่อไป
    - Customer concentration สูง — Vertiv พึ่งพาลูกค้า hyperscale/neocloud เพียงไม่กี่ราย
    - สตาร์ทอัพอิสระเสี่ยงถูกซื้อก่อนจะโตเต็มที่ (exit เร็วแต่ upside จำกัดสำหรับนักลงทุนช้า)
    - Deal closure risk — ดีลใหญ่ๆ ยังต้องผ่าน regulatory approval

</details>


---


# 9. แหล่งอ้างอิง

  - Global Market Insights, MarketsandMarkets, Persistence Market Research, Mordor Intelligence, Research and Markets, Precedence Research, Technavio — market sizing
  - Alliance Chemical, DataCenterKnowledge, Vertiv, Supermicro — cooling technology explainers
  - Schneider Electric Blog, Adam Silva Consulting, Fireline Broadband, TechPlusTrends — rack density & demand analysis
  - The Motley Fool, HeyGoTrade, 24/7 Wall St, MarketWise, Insider Monkey — stock analysis (VRT, NVT, MOD, XYL)
  - Congressional Research Service, AKCP, Global Statistics, Forbes — water usage data
  - Global Venturing, CTech, DCD, Axomap, New Market Pitch — startup landscape

> **📅** 

    จัดทำโดย Claude — สิงหาคม 2026 — ข้อมูล ณ วันที่รวบรวมอาจเปลี่ยนแปลงได้ ไม่ใช่คำแนะนำทางการเงิน ควรตรวจสอบข้อมูลล่าสุดก่อนตัดสินใจลงทุนจริง
