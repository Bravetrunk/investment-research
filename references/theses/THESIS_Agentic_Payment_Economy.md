
# Agentic Payment System / Agentic Economy


> **🤖** 

    สรุปประเด็น **Agentic Payment System / Agentic Economy** ในมุมมอง Investment Thesis — รวบรวมจาก McKinsey, BCG, Bain, Morgan Stanley, Grand View Research, Visa/Mastercard/Stripe/OpenAI/Coinbase official announcements และ VC theses (NEA, BCV, Madrona) ณ ปลายปี 2025 – กลางปี 2026


# 1. Executive Summary

  **Agentic Commerce** คือรูปแบบใหม่ของอีคอมเมิร์ซที่ AI Agent ทำหน้าที่แทนมนุษย์ในการค้นหา ตัดสินใจ และ**ชำระเงินแทนผู้ใช้** (autonomous discovery → authorization → payment → fulfillment) แทนที่การคลิกซื้อแบบเดิม นี่คือการเปลี่ยนแปลงเชิงโครงสร้างของ payment rail ที่ใหญ่ที่สุดนับตั้งแต่ mobile payment/contactless

  - ตลาด **Agentic Commerce** มีมูลค่า **5.7 พันล้านดอลลาร์ (2025)** และคาดว่าจะโต **65.5 พันล้านดอลลาร์ภายในปี 2033** (Grand View Research)
  - **McKinsey (Oct 2025):** Agent-orchestrated retail spend ทั่วโลกจะแตะ **$3-5 ล้านล้านดอลลาร์ ภายในปี 2030**, ในจำนวนนี้ US B2C เพียงอย่างเดียวสูงถึง **$900B-1T**
  - **Morgan Stanley (Dec 2025):** US e-commerce ที่ขับเคลื่อนโดย agentic shopper จะสูงถึง **$190-385B (10-20% ของ online retail)** ภายในปี 2030
  - **Bain & Co (Dec 2025):** US agentic commerce market จะอยู่ที่ **$300-500B (15-25% ของ e-commerce)** ภายในปี 2030
  - **Gartner (Nov 2025):** B2B spend ผ่าน AI agent exchange จะสูงถึง **$15 ล้านล้านดอลลาร์ ภายในปี 2028**
  - **Galileo:** Agentic payment market โดยเฉพาะ (infra layer) จะโตจาก **$7B → $93B ภายในปี 2032** (13x)
  ข้อสรุปเชิงกลยุทธ์: นี่ไม่ใช่แค่ "ฟีเจอร์ใหม่" แต่เป็นการ **rewrite ผู้เล่นในห่วงโซ่ payment ทั้งหมด** — ตั้งแต่ card network, PSP, stablecoin infra, ไปจนถึง identity/trust layer ใหม่ที่ยังไม่มีใครผูกขาด


---


# 2. โครงสร้างพื้นฐาน & Protocol War (ใครกำลังวางกติกา)

  การแข่งขันด้าน "มาตรฐาน" (protocol standard) คือสมรภูมิสำคัญที่สุดตอนนี้ เพราะใครกำหนด standard ได้ = คุมทั้ง ecosystem


## 2.1 Agentic Commerce Protocol (ACP) — OpenAI + Stripe

  - เปิดตัวพร้อม **Instant Checkout** ใน ChatGPT (เริ่มจาก Etsy, ตามด้วย Shopify merchants เช่น Glossier, SKIMS, Spanx, Vuori)
  - Open standard, ผู้ merchant ยังคงเป็น "merchant of record" — ควบคุม fulfillment/return/pricing เอง
  - ใช้ **Shared Payment Token (SPT)** ของ Stripe ในการส่งสิทธิ์ชำระเงินโดยไม่เปิดเผยข้อมูลบัตรจริง
  - Stripe ที่ integrate อยู่แล้วเปิดใช้ agentic payment ได้ในโค้ดบรรทัดเดียว → moat ของ Stripe แข็งมาก

## 2.2 Visa — Trusted Agent Protocol (TAP) + Intelligent Commerce

  - เปิดตัว **TAP** (ต.ค. 2025) หลัง AI-driven traffic เข้าเว็บ retail สหรัฐฯ พุ่ง **4,700%** ในปีที่ผ่านมา — ยืนยันตัวตน agent ด้วย cryptographic signature (timestamp + nonce)
  - **Agentic Directory + Agent Score**: ทำเนียบ agent/merchant ที่ verified แล้ว, OpenAI เป็น agent identity แรกที่ integrate
  - ลงทุนใน **Replit** (พ.ค. 2026) ฝัง Visa Intelligent Commerce เข้า IDE โดยตรง — ดัก developer layer ตั้งแต่เขียนโค้ด
  - Stablecoin settlement แตะ **$70B annualized (มี.ค. 2026)**

## 2.3 Mastercard — Agent Pay for Machines (AP4M)

  - เปิดตัว 10 มิ.ย. 2026 — รองรับธุรกรรมความเร็วระดับ machine-to-machine ข้าม card/bank account/stablecoin
  - บันทึกสิทธิ์การใช้จ่าย (permission) บน **Polygon, Solana, Base**
  - พาร์ทเนอร์เปิดตัว 30+ ราย: Stripe, Coinbase, Adyen, Cloudflare, Ripple, Aave, OKX, [Checkout.com](http://Checkout.com)

## 2.4 Stablecoin/Crypto-native rail — x402 (Coinbase) และ Agentic Payments Alliance

  - **x402 protocol** (Coinbase) ประมวลผลไปแล้ว **~165 ล้าน agent transactions** ในช่วงเดือนแรกๆ
  - **x402 Foundation** (Linux Foundation, ก่อตั้ง 14 ก.ค. 2026) มี 40 บริษัทผู้ก่อตั้ง รวม Visa, Mastercard, Amex, Stripe, Google, AWS, Coinbase
  - **Agentic Payments Alliance** (Rain, 18 ส.ค. 2026): coalition 26 บริษัท รวม Visa, Mastercard, Circle, Solana, Uniswap Labs, Fiserv, Fireblocks, Chainalysis, Remitly — ตั้งกฎว่า agent พิสูจน์ตัวตน + วงเงินใช้จ่ายอย่างไร (คุมมาตรฐานเองก่อนที่ regulator จะเข้ามา)
  **ข้อสังเกตเชิง thesis:** ยังไม่มี protocol ใดผูกขาด — เป็น multi-rail war (card-network vs stablecoin vs closed-loop AI-platform) ผู้ชนะระยะยาวน่าจะเป็นผู้ที่ควบคุม **identity/trust layer** (ใครคือ "agent ที่แท้จริง" ไม่ใช่ bot ปลอม) มากกว่าผู้ที่ควบคุม settlement rail เพียงอย่างเดียว


---


# 3. แผนที่ผู้เล่น (Market Map)

| บทบาท | ผู้เล่นหลัก | ชั้น (Layer) |
| ออก credential ให้ agent, ยืนยันตัวตน, ตั้ง liability framework | Visa, Mastercard, Amex | **Card Networks / Rails ดั้งเดิม** |
| ประมวลผล token การจ่ายเงินที่ agent ส่งมา | Stripe, Adyen, Braintree, [Checkout.com](http://Checkout.com) | **PSP / Checkout infra** |
| เป็น "หน้าร้าน" ใหม่ที่ user คุยด้วยแล้วซื้อเลย | OpenAI (ChatGPT), Google, Perplexity | **AI Platform (จุดตัดสินใจซื้อ)** |
| settlement แบบ machine-speed, ไม่ผ่าน card rail แบบเดิม | Coinbase (x402), Circle, Solana, Ripple | **Crypto/Stablecoin rail** |
| wallet/spend-control infra เฉพาะสำหรับ AI agent (ยังเป็น niche, seed-stage) | Skyfire, Payman, Nekuda, PayOS | **Agent-payment infra startups** |
| คัดกรอง agent จริงจาก bot ปลอม, ป้องกัน fraud รูปแบบใหม่ | Chainalysis, Visa Agent Score | **Identity/Trust/Fraud** |

### ตัวอย่าง Funding ระดับ Infra Startup

  - **Nekuda** (ก่อตั้ง 2024, NY) — ระดม **$5M seed** นำโดย Madrona, ร่วมด้วย Amex Ventures, Visa Ventures — สร้าง payment infra ให้ AI agent ทำธุรกรรมได้อย่างปลอดภัย
  - คู่แข่งในตลาดเดียวกัน: Skyfire, Payman, PayOS, Airwallex, Sardine, Primer, Basis Theory
  - Visa ได้ partner โดยตรงกับ Skyfire, Nekuda, PayOS, Ramp เพื่อทำธุรกรรม AI แบบปลอดภัย (ธ.ค. 2025)
  - **Rezolve AI** (public, SEC filing): agentic commerce infra revenue run-rate $232M exiting 2025, guidance $360M สำหรับปี 2026 — เคสตัวอย่างว่า pure-play agentic commerce สามารถ scale revenue ได้เร็วแค่ไหน

---


# 4. Investment Thesis — โอกาสการลงทุนแบ่งตามชั้น


### 🟢 High Conviction (Infra ที่ regulator/network ต้องพึ่งพา)

  - **Card network incumbents (Visa, Mastercard)** — ได้ประโยชน์สองต่อ: (1) ค่าธรรมเนียม VAS ที่มาร์จิ้นสูงขึ้นจาก AI/identity services (Visa VAS revenue +26% YoY) (2) ควบคุม trust layer ที่ agent ต้องพึ่ง
  - **Stripe** (private) — ตำแหน่ง "ผู้ร่วมเขียนมาตรฐาน" ACP ทำให้เป็น default rail สำหรับ AI-native commerce
  - **Identity/fraud infra** (Chainalysis-type) — ทุก agent transaction ต้องผ่านการ verify ตัวตน = TAM ใหม่ที่ไม่มีมาก่อน

### 🟡 Speculative แต่ Asymmetric (early-stage infra)

  - **Agent-payment-native startups** (Skyfire, Payman, Nekuda, PayOS) — เดิมพันสูง เพราะยังไม่ชัดว่า incumbent (Visa/Stripe) จะ build เองแล้วฆ่า niche นี้หรือไม่ แต่ถ้ารอด อาจกลายเป็น "Stripe ยุค agent"
  - **Stablecoin settlement rail** (Circle, Coinbase x402) — ได้ประโยชน์จาก machine-speed transaction ที่ card rail (batch, T+ settlement) ตามไม่ทัน
  - **Vertical AI commerce platforms** ที่ผูก ACP/TAP เข้ากับ niche (เช่น B2B procurement agent, travel agent)

### 🔴 ความเสี่ยงที่ต้องติดตาม

  1. **Regulatory vacuum** — Agentic Payments Alliance กำลังเขียนกติกาเองเพราะ regulator (สหรัฐฯ) ยังไม่ออกกฎ → ความเสี่ยงว่ากติกาที่เขียนเองอาจถูก override ภายหลัง หรือเกิด fragmentation ระหว่างมาตรฐาน
  1. **Liability ambiguity** — ใครรับผิดชอบเมื่อ agent transaction ผิดพลาด/ฉ้อโกง (ผู้ใช้ / แพลตฟอร์ม AI / merchant / bank) ยังไม่มีกรอบชัดเจน
  1. **Protocol fragmentation risk** — มี ACP (OpenAI/Stripe), TAP (Visa), AP4M (Mastercard), x402 (Coinbase) พร้อมกันหลายมาตรฐาน — winner-take-most ยังไม่ชัด อาจเสียเวลา/ทุนไปกับมาตรฐานที่แพ้
  1. **Merchant trust & margin compression** — ค่าธรรมเนียมใหม่ (agent tax) อาจกดมาร์จิ้น merchant, และ agent อาจ optimize เพื่อราคาถูกที่สุดจนทำลาย brand loyalty แบบเดิม
  1. **Market sizing spread กว้างมาก** ($8B ถึง $5T ขึ้นกับสำนักวิจัย) — สะท้อนว่า ยังเป็นตลาดช่วงต้น (early innings) การประเมินมูลค่าบริษัทจึงเสี่ยงต่อ hype-driven valuation

---


# 5. สรุปมุมมองการลงทุน

  1. **Bet บน Layer ที่มี network effect ของ trust/identity** มากกว่า bet บนแอปพลิเคชันหน้าบ้าน (chatbot ซื้อของ) เพราะ layer หน้าบ้านแข่งขันดุเดือดและ margin ต่ำ
  1. **Incumbent (Visa, Mastercard, Stripe) มีความได้เปรียบเชิงโครงสร้าง** เพราะควบคุม distribution + regulatory relationship อยู่แล้ว — การลงทุนใน incumbent คือ "low-beta exposure" ต่อธีมนี้
  1. **Infra startup เฉพาะทาง (Skyfire, Nekuda, Payman)** คือ high-beta play ที่เหมาะกับ seed/Series A investor ที่รับความเสี่ยงจาก M&A โดย incumbent ได้ (exit path ที่สมเหตุสมผลที่สุดคือถูกซื้อโดย Visa/Mastercard/Stripe)
  1. **Timeline การ scale จริง**: 2026-2028 คือช่วง standard-setting และ pilot, การ monetize อย่างมีนัยสำคัญ (>10% ของ e-commerce) น่าจะเริ่มเห็นชัดหลังปี 2028-2030 ตาม McKinsey/Bain forecast
  1. สำหรับ **VisuMed/MedViz หรือ product อื่นที่ทำ patient education** — ควรจับตา agentic commerce ในมุม "agent ช่วยผู้ป่วยจ่ายค่ารักษา/ซื้อยาแทน" ซึ่งอาจเป็น use case เฉพาะทาง (vertical) ที่ยังไม่มีคนจับในตลาดนี้

---


> **📚** 

    **แหล่งอ้างอิงหลัก:** BCG Global Payments Report 2025, McKinsey Global Payments Report 2025, Grand View Research (Agentic Commerce Market), Bain & Co (Dec 2025), Morgan Stanley (Dec 2025), Gartner (Nov 2025), Galileo, OpenAI/Stripe ACP announcement, Visa TAP/Intelligent Commerce newsroom, Mastercard AP4M launch, Coinbase x402, Rain Agentic Payments Alliance, CB Insights (Nekuda/agentic commerce market map), NEA Fintech Thesis


---


# 6. Deep Dive — พฤติกรรมผู้บริโภค, เหตุที่ใช้ AP4M, ตลาดที่รองรับ และสินค้า/นวัตกรรมที่เกี่ยวข้อง


> **⚠️** 

    **จุดแยกชั้นก่อนอ่าน:** **AP4M (Agent Pay for Machines)** ของ Mastercard **ไม่ใช่** ปุ่มให้ผู้บริโภคกดซื้อออนไลน์ — มันเป็นรางสำหรับ **เครื่องจ่ายเครื่อง** (ธุรกรรมความถี่สูง มูลค่าต่ำถึงเศษสตางค์ ทำงาน 24 ชม. ในพื้นหลัง) ชั้นผู้บริโภคคือ **Mastercard Agent Pay (2025)** + ACP/TAP ถ้าวิเคราะห์สองชั้นไม่ช้อนกัน แต่เงื่อนให้ AP4M จะผิดเร็วกว่า GMV ฝั่งผู้บริโภค


## 6.1 พฤติกรรมผู้บริโภค — ใช้ AI หาของได้แล้ว แต่ยังไม่ยอมให้จ่ายแทน

  ตลาดผู้บริโภคปี 2026 อยู่ในช่วง **“AI เป็น search engine ที่ดีขึ้น ยังไม่ให้เป็น ผู้จ่าย”**

  - ใช้ AI ในขั้นต้นทางสูง: ราว **62–68%** ใช้ AI เทียบราคา/แบรนด์/รีวิว และกว่าครึ่งใช้เพื่อเรียนรู้หมวดสินค้า — แต่จำนวนที่**ปล่อยให้ AI ปิดดีลและจ่ายเงินจบ** ยังต่ำ: NMI พบว่ามีเพียง **11%** ที่เคยใช้ AI จนจบธุรกรรม และ **45%** บอกว่าไม่เชื่อถือให้ AI ซื้อแทนเลย
  - **Trust gap:** ราว 65% ไว้ใจให้ AI เทียบราคา แต่มีเพียง ~14% ที่ไว้ใจให้สั่งซื้ออัตโนมัติเต็มตัว — นี่คือเบรกหลักของชั้น L3 autonomous checkout ปี 2026
  - คนยอมมอบอำนาจเฉพาะงานที่ **เสี่ยงต่ำ + ทำซ้ำได้:** สำรวจหนึ่งพบว่า **71%** ยอมให้เอเจนต์ซื้อของประจำ/refill (ของใช้ในบ้าน, จองเที่ยวซ้ำ, commodity electronics) แต่เมื่อราคาสูงหรือของที่ต้อง “รู้สึก” ความยอมรับดิ่งลง
  - **เงื่อนไขที่คนขอเพื่อมอบอำนาจ:** spending cap, ถอนสิทธิ์คืนได้ทันที, ยกเลิกง่าย/คืนของได้, มนุษย์รีวิวก่อนจ่ายในรายการใหญ่ — วงเงินที่คนยอมให้จ่ายโดยไม่ต้องอนุญาตซ้ำอยู่ราว **£177 / ~$224 ต่อรายการ** (ต่ำกว่าที่ร้านค้าคาดไว้)
  - **กลุ่มที่ขยับเร็ว:** พ่อแม่ที่มีลูก, Millennial, Gen Z — พ่อแม่ยอมให้ AI ซื้อในงบที่กำหนดราว 43% และยอมให้เติมของใช้ในบ้านอัตโนมัติสูงกว่าคนไม่มีลูก เพราะ “ลดภารงานบ้าน” สำคัญกว่าการควบคุมทุกคลิก
  - ผลข้างเคียง: มีรายงานว่า **59%** บอกว่า AI ลดโอกาสคืนสินค้า — ถ้าเอเจนต์เลือกถูกตั้งแต่แรก merchant ได้ทั้ง conversion และลด reverse logistics
| สถานะ 2026 | สิ่งที่คนยอม | ราง payment ที่ใช้ | ระดับ |
| สูง (60%+) | ค้นหา เทียบ แนะนำ | ยังไม่แตะเงิน | **L1 Assist** |
| กำลังโตในพ่อแม่ / Gen Z | ซื้อของประจำในงบที่ล็อกไว้ | Agent Pay / ACP / TAP | **L2 Delegated** |
| ยังน้อยมากใน B2C | จ่ายเองทั้งวงจรโดยไม่ถาม | ยังไม่ใช่แหล่งรายได้หลักปี 2026–27 | **L3 Autonomous** |
  **นัยต่อ thesis:** ผู้บริโภคคนยังไม่ใช่เหตุหลักที่ AP4M ถูกใช้มากขึ้นปีนี้ — แต่เป็นผู้กำหนดงบ + เงื่อนไขของ L2


## 6.2 ทำไม AP4M ถูกใช้มากขึ้น (แรงขับอยู่ที่เครื่อง ไม่ใช่คนกดซื้อ)

  AP4M โตเพราะไปแก้ปัญหาที่รางบัตรแบบเดิม **ทำไม่ได้เชิงเศรษศาสตร์** กับธุรกรรมความถี่สูง + มูลค่าต่ำมาก

  1. **โมเดลธุรกิจของเอเจนต์คือ “คิดเงินเป็นหน่วยเล็ก ต่อเนื่อง”** — จ่ายค่า inference, MCP tool, API, ข้อมูล, compute, โดเมน, โฮสติ้ง, โฆษณา ทีละ $0.001–$0.12 หลายพันครั้งต่อเวิร์กโฟลว์ interchange + batch settlement แพงและช้าเกินไปไม่ได้
  1. **Always-on + guaranteed settlement** — คู่ค้ามั่นใจว่าจะได้รับเงิน แม้ผู้จ่ายจะเป็นซอฟต์แวร์ ไม่ใช่มนุษย์ที่กด 3-D Secure
  1. **ชั้นความเชื่อถือตรวจสอบได้** — 4 เสา: Credentialing → Permissioning → Transacting → Settling สิทธิ์ของเอเจนต์ถูกบันทึกบน **Polygon / Solana / Base** คู่สัญญาตรวจได้เองว่าเอเจนต์นี้จ่ายได้เท่าไหร
  1. **เครือข่ายวันแรกหนา** — 30+ รายวันเปิดตัว: Stripe, Adyen, [Checkout.com](http://Checkout.com), Cloudflare, Coinbase, OKX, Ripple, Polygon, Solana, Aave, Skyfire, PayOS, Nevermined, Rain, Tempo — distribution ของเครือข่ายบัตรทำให้ adoption เร็วกว่าโปรโตคอลที่ไม่มี issuer/acquirer
  1. **มี demand ที่จับต้องได้บนรางพี่น้อง** — x402 ประมวลผลธุรกรรมเอเจนต์ไปแล้วหลายสิบถึงร้อยล้านรายการ; Polygon เคยระบุว่าครองส่วนใหญ่ของ x402 settlement — AP4M ดึง volume ที่เกิดแล้วเข้าเครือข่ายที่มี liability + แบรนด์ธนาคารรับได้
  1. **องค์กรใช้ก่อนผู้บริโภค** — use case ที่ Mastercard ยกเกือบทั้งหมดเป็น B2B/SMB operations: เอเจนต์สร้างเว็บร้าน (ซื้อโดเมน+โฮสต์+รูป+checkout ในงบ), เอเจนต์โลจิสติกส์จ่ายค่าระวง/ท่าโหลด/ข้อมูลห้องเย็นตามเส้นทางสินค้า

> **💡** 

    คนยังไม่ใช้ AP4M โดยตรง แต่**บริษัทที่คนใช้บริการ เริ่มให้เอเจนต์ของบริษัทไปใช้ AP4M** — ดังนั้นตัวเลขธุรกรรมเครื่องจะพุ่งก่อน GMV ผู้บริโภค


## 6.3 ตลาดที่รองรับ (เรียงตามความพร้อมกับสเปก AP4M)

  **พร้อมใช้ทันที (2026–2027)**

  - Pay-per-inference / paid MCP tools / API metering — หน่วยเล็ก ความถี่สูง ราคาไม่คงที่ (สคีม “upto”) ตรงสเปก AP4M ที่สุด; AWS AgentCore Payments (GA ส.ค. 2026) กำลังดึงเคสนี้
  - Compute, data feed, crawl, content unlock — pay-to-access / pay-to-crawl แทนโมเดลสมัครสมาชิก
  - เครื่องมือสร้างธุรกิจอัตโนมัติ (Lovable และพวก agent-builder) — เอเจนต์จ่ายค่าบริการย่อยหลายเจ้าในเวิร์กโฟลว์เดียว
  - Stablecoin treasury ของบริษัทคริปโต/ฟินเทค ที่ต้องการ settlement วันหยุดและข้ามโส่
  **กำลังก่อตัว (2027–2029)**

  - โลจิสติกส์ / ซัพพลายเชน — ค่าบริการย่อยตามเหตุการณ์ (ไม่ใช่ใบแจ้งหนี้รายเดือน)
  - ยานยนต์เชื่อมต่อ / IoT — ค่าทางด่วน ชาร์จไฟ จอดรถ ดาต้าแพ็กของอุปกรณ์
  - B2B procurement agent — ตัวเลข Gartner กว้าง แต่ยัง early innings — TAM กว้างสุด ต้องดูจากนิยามบริบทเดียว
  **แนวตั้งที่ยังว่าง + ตรงพฤติกรรมพ่อแม่**

  - **สุขภาพ:** เอเจนต์ช่วยคนไขเทียบราคายา นัดหมาย จ่าย copay/ค่ารักษาในวงเงินที่ครอบครอล็อกไว้ — ยังไม่มี incumbent ทำครบวงจรในเอเชีย (ตรงกับหมาย VisuMed/MedViz ในข้อ 5)
  **ตลาดที่ยังไม่รองรับ AP4M ดี:** luxury / high-consideration B2C — คนยังอยากอยู่ในการตัดสินใจ และแบรนด์ไม่อยากให้เอเจนต์ optimize เหลือแต่ราคา


## 6.4 บริการหรือสินค้าใหม่ที่น่าจะโผ่จากรางนี้

  1. **Agent Wallet + Policy Engine** — กระเป๋าของเอเจนต์ที่มีเพดานรายวัน หมวดห้ามซื้อ รายชื่อผู้รับเงินที่อนุญาต ถอนสิทธิ์ได้ทันที (ตัวที่ผู้บริโภคขอมากที่สุด)
  1. **Agent Credit / Treasury** — Aave เข้าพาร์ทเนอร์วันแรกด้วยเหตุนี้: เอเจนต์ไม่ถือเงินสดก้อนใหญ่ แต่ดึงสภาพคล่องระสั้นมาจ่ายงานที่กำลังทำ
  1. **Metered API Marketplace** — ร้านค้าของ “ความสามารถ” (ค้นเว็บ, OCR, ข้อมูลราคา, โมเดลเฉพาะทาง) ตั้งราคาต่อครั้ง
  1. **Agent Identity + Reputation Score** — คู่ของ Visa Agent Score ฝั่ง Mastercard; merchant รับจ่ายจากเอเจนต์ที่สกอร์สูงโดยคิด interchange ต่างกัน
  1. **Agent Insurance / Liability wrap** — สินค้าที่ตลาดขาดที่สุด: เมื่อเอเจนต์ซื้อผิด ไครจ่าย — เหตุผลที่คนยังไม่ปล่อย L3
  1. **Dispute rail สำหรับเครื่อง** — chargeback แบบเดิมใช้กับมนุษย์; เครื่องต้องการหลักฐาน cryptographic + mandate ไม่ใช่ฟอร์ม 180 วัน
  1. **Pay-per-use แทน subscription** — SaaS, ข่าว, เครื่องมือครีเอเตอร์, คลาวด์ย่อย จะถูกรื้อเป็นหน่วยเล็กเมื่อต้นทุนเคลียร์รายการต่ำพอ
  1. **Vertical agent packs** — ชุดสำเร็จรูป เช่น “เอเจนต์ร้านค้า SMB”, “เอเจนต์โลจิสติกส์”, “เอเจนต์ดูแลครอบคร/ครัว” ที่มากับวงเงินและรายการอนุญาตสำเร็จรูป
  **ไม่ควรคาดเร็ว:** เอเจนต์ซื้อบ้าน รถ ของหรู หรือสินเชื่อรายใหญ่โดยไม่มีมนุษย์เซ็น — กฎ consumer protection + liability ยังไม่ตามทัน


## 6.5 Innovation อื่นๆ ที่เกี่ยวข้อง (stack ที่ AP4M ไปชน)

  - **Intent / Commerce journey:** ACP (OpenAI+Stripe), UCP (Google+Shopify+ร้านค้าใหญ่), Instant Checkout ใน ChatGPT
  - **Authorization / mandate:** AP2 ของ Google (ตอนนี้อยู่กับ FIDO Alliance), Visa TAP + Intelligent Commerce
  - **Machine micropayment native:** x402 (Coinbase / x402 Foundation), MPP (Stripe+Tempo)
  - **Agent communication / tools:** MCP, A2A
  - **Identity ของเอเจนต์:** ERC-8004, Verifiable Intent ของ Mastercard, Visa Agent Directory/Score
  - **Cloud control plane:** AWS AgentCore Payments — ผูกกระเป๋า Coinbase/Privy + รองรับสคีมราคาแบบ “upto”
  - **Settlement 24/7:** Mastercard เปิด card settlement ด้วยสเตเบิลคอยน์บนหลายโส่แล้ว (USDC, PYUSD, RLUSD) — AP4M นั่งบนรางชุดนี้
  **หน้าที่ของ AP4M ใน protocol war:** ไม่ได้แย่ง ACP ตอน checkout ของคน แต่เป็น **รางหลังบ้านที่เอเจนต์จ่ายกันเองระหว่างทำงาน** — ถ้าคู่ค้าเครื่องยอมจ่ายผ่าน Mastercard ถ้าได้ settlement guarantee + credential ที่ธนาคารรับได้


## 6.6 นัยต่อการลงทุน (เติมจากข้อ 4–5)

  1. **อย่าไม่ bet AP4M ว่าเป็นแอปช้อปปิ้งผู้บริโภค** — bet ว่าเป็น infra ของ **metered AI economy** ที่บัตรอย่างเดียวทำไม่ได้
  1. **ผูชนะระยะใกล้คือผูที่ขายความเชื่อถือให้เครื่อง** (credential + spend policy + guaranteed settlement) ไม่ใช่ผูที่ทำ chatbot สวยกว่า
  1. **จังหวะ monetize ผู้บริโภคช้ากว่าเครื่อง 2–4 ปี** แต่แนวตั้งสุขภาพ/ครอบครที่มีวงเงินชัดและของที่ซื้อซ้ำได้ อาจข้ามคิวได้ถ้าออกแบบปุ่ม “อนุมัติกรอบ” ไม่ใช่ปุ่ม “ซื้อให้ฉันทุกอย่าง”
  **ความเสี่ยงที่ต้องติดตามจากข้อ 4**

  - Volume จริงของ machine payment ยังเล็กเมื่อเทียบพาดหัว (ธุรกรรมยอย แต่มูลค่าต่อรายการต่ำ; มีเสียงวิเคราะห์ว่ามี self-dealing ปน) — อย่าประเมินมูลค่าบริษัทจากจำนวน tx อย่างเดียว
  - ผู้บริโภคยังเป็นเบรกของชั้น L3 อย่างน้อยสิ้ง 2028
  - Protocol war อาจทำให้ merchant ต้องรองรับ 4–6 รางพร้อมกัน อีก 2 ปี — ต้นทุน integrate สูง มาตรฐานช้า

---


> **📚** 

    **แหล่งอ้างอิงเพิ่มสำหรับข้อ 6:** Mastercard AP4M press + product page (มิ.ย. 2026), NMI Embedded Payments / Agentic Commerce Reality Check, [Checkout.com](http://Checkout.com) Agentic Commerce 2026, Forrester / Forbes liability survey, Zeta Global AI shopping research, RTB House / Retail Dive, McKinsey Shopping in the Age of AI, Polygon x402 settlement note, AWS AgentCore Payments GA, Adyen M2M payments briefing, x402 Foundation / MPP coverage


---


# 7. Architecture Deep Dive — Six-Layer Stack + Protocols (รวมกับข้อ 2 และ 6.5)


> ส่วนนี้ไม่ซ้ำตัวเลข TAM / GMV ในข้อ 1 — เพิ่มฉพาะสถาปัตยกรรม โปรโตคอลที่ยังไม่ละเอียด และกรอบกฎหมาย


## 7.1 สิ่งที่ต่างจากข้อ 1–6

  Agentic payment **ไม่ใช่ API ที่มนุษย์สั่งให้จ่าย** — agent ต้องทำวงจรครบเอง: discover → เปรียบเทียบราคา/SLA → พิสูจน์สิทธิ์จ่าย → เจรจา → settle ทันที

  โปรเจกชัน 40% ของ enterprise app จะฝัง task-specific agent ก่อนสิ้น 2026 (จาก <5% ใน 2025) — สอดคล้องกับมุมมองตลาดในข้อ 1


## 7.2 แผน 6 ชั้น (รวมกับ protocol war ในข้อ 2)

  จุดประสงค์: ไม่ได้ทิ้งราง fiat/crypto เดิม แต่สร้าง **orchestration layer** ให้เครื่องเดินออร์เดอร์–อนุมัติ–ชำระ

| หน้าที่ | โปรโตคอลหลัก | ชั้น |
| พบบริการ/เครื่องมือที่เรียกได้ | MCP, A2A Catalog, ERC-8004 | Discovery |
| ตัวตน + ชื่อเสียงคู่สัญญา | ERC-8004, Visa Agent Score | Trust |
| สั่งของ ราคา เงื่อนไข | **ACP** (OpenAI+Stripe) | Ordering |
| พิสูจน์ว่า agent มีสิทธิ์จ่าย | **AP2** (Google+60 สถาบัน), TAP, AP4M permission | Authorization |
| ย้ายมูลค่า | AP2 (fiat), **x402** / **MPP** (crypto + session) | Payment |
| ส่งมอบหลังชำระ | ยังแยกที่สุดใน stack (2026) — merchant proprietary | Fulfillment |

## 7.3 เปรียบเทียบโปรโตคอลหลัก (เสริมกันไม่แข่งกันด้วย)

| Crypto | Protocol | Fiat | ชั้น | รูปแบบที่เอาให้ | ผู้สร้าง |
| ใช่ (x402 ext.) | **AP2** | ใช่ | Authorization | Mandate พิสูจน์ intent ล่วงหน้า | Google + PayPal/Amex/MC/Adyen/Coinbase |
| Native stablecoin | **x402** | ไม่ | Execution | Micropayment ทันทีผ่าน HTTP 402 | Coinbase + Cloudflare |
| ใช่ | **MPP** | ใช่ | Execution | Session billing / ใช้งานต่อเนื่อง | Stripe + Tempo (IETF draft-httpauth-payment-00, มี.ค. 2026) |
| ไม่ | **ACP** | ใช่ | Ordering | Checkout endpoints + SharedPaymentToken | OpenAI + Stripe |
| Orchestration | **AGTP** | N/A | Transport | แยก traffic เครื่องออกจาก HTTP คน + intent verbs | IETF draft |
| ใช่ | TAP / AP4M | ใช่ | Auth + machine rail | ดูข้อ 2 และ 6 | Visa / Mastercard |

### AP2 — Intent Mandate vs Cart Mandate

  - ปรัชญา **intent มากกว่า authentication** — พิสูจน์ว่า agent ทำตามที่เจ้าของมนุษย์ ไม่เพียงว่าถือ credential
  - **มนุษย์อยู่:** Intent Mandate → agent หาของ → มนุษย์เซ็น Cart Mandate (ล็อกรายการ+ราคา)
  - **มอบหมาย (เช่นซื้อบัตรคอนเซิร์ต):** เซ็น Intent Mandate ล่วงหน้า (เพดานราคา / ร้านอนุญาต / เวลา) → agent ออก Cart Mandate เอง โดยไม่ต้องมนุษย์อยู่
  - รองรับบัตร / real-time bank transfer + stablecoin ผ่าน A2A x402

### x402 — HTTP 402 กลับมาใช้ (เติมจากข้อ 2.4)

  1. Agent ขอ resource → server ตอบ HTTP 402 + header ราคาสูงสุด / สกุลที่รับ / wallet ปลายทาง
  1. Runtime จ่าย stablecoin บน Base / Solana / Polygon → retry พร้อมหลักฐาน onchain
  1. Validate ~**200 ms** — ไม่ต้องบัญชี account, API key, KYC, recurring billing
  1. เหมาะกับ M2M micropayment; **ไม่รองรับ fiat** (ต่างจาก AP2/MPP/AP4M)

### MPP — Session ไม่ใช่ tx ทุก micro-second

  - เปิด session → สะสม usage ด้วย offchain voucher → settle ครั้งเดียวเมื่อปิด session
  - ใช้งาน: scrape, inference ต่อเนื่อง, data stream
  - ผูกกับ Stripe PaymentIntents → ได้ compliance / ภาษี / fraud ของ enterprise ทันที

### ACP — เติมจากข้อ 2.1

  - REST: Create / Update / Complete / Cancel Checkout
  - SharedPaymentToken = ใช้ครั้ง + มีอายุ
  - Merchant ต้องซิงแฟ้วรายวัน หรือ API upsert + **นโยบายสินค้าห้าม** (อายุ/วัสดุ/ผลิตการเงินไม่มีไลเซนส์) — ภาระ compliance ตกที่ merchant

### AGTP — Transport ใหม่

  - แยก agent traffic ออกจาก HTTP คน: QUIC :8443 หรือ TCP/TLS :8080
  - Verbs: QUERY, SUMMARIZE, BOOK, SCHEDULE, LEARN, DELEGATE, COLLABORATE, CONFIRM, ESCALATE, NOTIFY, **PURCHASE**
  - Header บังคับ: Agent-ID 256-bit (จาก birth certificate) + Authority-Scope — proxy/LB enforce ได้โดยไม่ต้องลง inspect แอป

---


# 8. Trust Layer — Know Your Agent (KYA) + ERC-8004

  KYC/AML แบบเดิม (บายนิ้ว / ที่อยู่ / เอกสารรัฐ) **ใช้กับ software ไม่ได้** → มาตรฐานใหม่คือ **Know Your Agent**

  KYA ดู: ความชอบธรรมของโค้ด, เจ้าของ developer, รูปแบบพฤติกรรมย้อนหลัง — token ผูก merchant + software ID + ตัวตนมนุษย์เข้าด้วย เพื่อผ่าน CAPTCHA / 403 / checkout block

  สอดคล้องกับ **Visa Agent Score / Agent Directory** ในข้อ 2.2 และ identity ในข้อ 6.5


## ERC-8004 — onchain identity (แทน FICO ของเครื่อง)

  3 registry บน Ethereum:

  1. **Identity** — ID ถาวรติดข้ามเชน
  1. **Reputation** — อัตราสำเร็จ / งานเสร็จ / การรักษา constraint
  1. **Validation** — บันทึก execution + ZK proof ว่าทำงานในขอบเขต
  Logic อยู่ offchain, identity/reputation ติด onchain — merchant query สคอร์ในมิลลิวินาทีก่อนรับออเดอร์มูลค่าสูง


---


# 9. Enterprise Infrastructure (รวมกับ market map ข้อ 3)

  ส่วนนี้ไม่ซ้ำชื่อที่มีอยู่ (เช่น Skyfire, Payman) แต่เพิ่มรายละเอียดสถาปัตยกรรม

| Platform | จุดแตก | เวลา setup | Settlement | จุดขาย |
| **Nevermined** | append-only log, latency <50ms | <20 นาที | Crypto + fiat | Sell-side metering |
| **Skyfire** | PAY token + Visa/Discover card | <10 นาที | Crypto หลัก | KYA + wallet abstraction |
| **Coinbase Agentic Wallets** | MPC+TEE, gasless, KYT, session cap | <2 นาที (CLI) | USDC บน Base | Institutional wallet |
| **Payman AI** | runtime budget + fiduciary control | ไม่คงที่ | Agnostic | L4 governance / policy |
| **Stripe retrofit** | compliance สูง — **ไม่เหมาะ micro-tx** | 2–4 สัปดาห์ | Fiat | Subscription / billing |

### Coinbase Agentic Wallets (ก.พ. 2026)

  - Prompt injection = ความเสี่ยงหลัก → **private key อยู่ใน TEE + MPC** LLM เรียกได้แค่ signing API ที่จำกัด
  - Session cap + per-tx limit ป้องกันถูกถวาย / การกู้ก้อนเดียว
  - x402 ฝังตัว + Base smart account — **gasless** (ไม่ต้องถือ ETH) + KYT กันทุก tx

### Skyfire

  - Wallet ID ที่ developer ควบ + dashboard วงเงินริเวล
  - ตัวอย่าง MCP+Apify: พบ tool → ออก PAY token → ส่ง `skyfire-pay-id` ตอบ 402 → ดึงข้อมูล — ไม่ต้องมนุษย์

### Nevermined (sell-side — คู่กับ Skyfire ที่เน้น buy-side)

  - Fiat rail เช่น Stripe 2.9%+$0.32 **กินกำไร micro-tx**
  - x402 + metering ทุก model call / A2A / MCP ถูกเซ็นล log ที่แก้ไไไไไ — ลด billing dispute

### AWS + Nuvei

  - **AWS Cognitive Payments Director:** Financial Controller (สัญญา/ผลงาน) + Legal Controller (compliance DB) + PSP Watch Observer (ขึ้น gateway)
  - **Nuvei Protocol Compatibility Layer:** API เดียวรับ ACP/AP2/MCP — มุ่งไป Visa Intelligent Commerce / Mastercard Agent Pay; ใช้ WaaS + virtual card แยกงบ

---


# 10. Legal / Liability (ขยายจากความเสี่ยงข้อ 4)

  ข้อ 4 บอกว่า liability ยังคลุม — ตัวบทกฎหมายสหรัฐสหรัฐ **พูดผู้วาง** เพราะ contract ที่ agent ทำไป **ผูกพัน** และฟ้องได้ยาก


## 10.1 Contracting authority

  - **ESIGN Act:** สัญญาไม่เสี่ยผลเพราะใช้ electronic agent
  - **UETA §14:** สัญญาเกิดจากการโต้ตอบของ electronic agents **แม้มนุษย์จะไม่ได้เห็นข้อตกลง**
  - **UCC 2-204:** การเรียก payment API / PO = มีสัญญา แม้บางข้อจะเปิดอยู่
  **Mitigation:** hard cap ที่ชั้น API (ไม่ใช่ policy บนเอกสาร) + เผยแพร่ scope-of-authority ป้อง apparent authority + EU AI Act จัด high-risk ถ้าเจรจา/ตัดสินสิทธิ์


## 10.2 Agency law — 2 บัญหาที่เฉพาะ AI

  กฎหมายดู 3 ฝ่าย: Principal – Agent – Third party (ไม่ใช่ 2 ฝ่ายพอรโกรแมร–เอเจนต์)

  1. **Errant Tool:** hallucination / เกิน mandate → principal **ยังต้องจ่าย** เพราะให้ apparent authority (เช่น chatbot ลดราคาตั๋วไม่ได้, ซื้อของใช้รายวันร้อยล้าน)
  1. **Loyalty problem:** agent เลือกของแพงกว่าเพราะ developer ฝัง kickback → ละเมิด fiduciary — ศาลจะหนัก highest standard of care กับองค์กรที่ออกแบบ
  Software ฟ้องได้ → ความรับผิด **ขึ้นไปที่ deployer/developer**


## 10.3 Tort / copyright / LFAI

  - ไม่มี mens rea → วัดด้วย **reasonableness** (ประมาทการละเลิย / product liability)
  - **Law-Following AI (LFAI):** ฝังกฎหมายลง alignment ให้ agent **ปฏิเสธกิจ** — สำคัญใน trading / งานรัฐ
| ผล / วิธีรับ | กฎหมาย | ปัญหา |
| ผูกพัน — ต้อง hard cap | UETA, ESIGN, UCC 2 | Enforceability |
| ผูกพันจ่าย — ต้อง disclaimer | Apparent authority / Errant Tool | Unauthorized action |
| หนัก deployer — ต้องโปร่งใสโค้ด | Fiduciary loyalty | Bias / kickback |
| LFAI + license ข้อมูล | Negligent supervision | Copyright / defamation |
  นัยต่อ thesis: **Agent Insurance / Liability wrap** ในข้อ 6.4 คือช่องที่ขาดที่สุด — กฎหมายยืนยันว่า principal จ่าย


---


# 11. Use Cases เชิงเทค (รวมกับข้อ 6.3–6.4)

  1. **Micropayments economy** — x402 + Nevermined ทำ pay-per-request / per-token / per-second ได้; fee เช่น Solana ~$0.00025 — แทน subscription ที่ใช้ซ่อนค่าครง fiat
  1. **Enterprise procurement / supply chain** — A2A หา vendor → AP2 mandate ยืนยันงบ → AGTP PURCHASE → x402 ดึงข้อมูล → MPP จ่ายโลจิสติกส์ต่อเนื่อง (ตรงกับ AP4M B2B ในข้อ 6.2)
  1. **Autonomous DeFi** — Agentic Wallets + Lightning L402; monitor yield / arbitrage / rebalance 24 ชม. ใน TEE + session cap

---


# 12. บทสรุปที่เพิ่มจาก architecture note

  1. Protocol **เสริมกันตามชั้น** ไม่แข่งกัน: ACP = ออเดอร์, AP2 = อำนาจ, x402 = micro-tx, MPP = session, AP4M/TAP = machine rail + bank liability — ยืนยันว่า fragmentation ในข้อ 4 ยังคง
  1. จุดบทที่ขาด: **identity/trust (KYA + ERC-8004 + Agent Score)** ยังคงคือจุดที่ใส่ในข้อ 5
  1. ความเสี่ยงที่มีเนื้อไม่เพียงกฎ: สัญญาผูกพัน + ไม่มี insurance wrap + Fulfillment ยังไม่มี standard
  1. Safeguard ที่ต้องมี: L4 policy engine, TEE/MPC, session cap, LFAI — ถ้าไม่มี ธีมจะไม่ scale ได้เพราะความรับผิดทางกฎ