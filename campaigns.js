/* campaigns.js
 * Dynamic campaign scheduler for year-round events
 * - Detects current date and shows the matching campaign
 * - Supports English (en) and Japanese (ja) locales based on <html lang="...">
 * - Falls back to default content when there's no active event
 * - Easy to extend: add events to the `EVENTS` array
 */

(function () {
    'use strict';

    const EVENTS = [
        {
            id: 'newyear',
            start: 101, // Jan 1
            end: 107,   // Jan 7
            locales: {
                en: {
                    icon: '✨🎉',
                    titleMain: 'New Year Giving',
                    titleSub: 'A fresh start for communities',
                    subtitle: 'Help rebuild and reconnect',
                    description: 'Start the year by supporting off-grid infrastructure and community projects around the world.',
                    cta: { text: 'Donate via PayPal', link: 'https://www.paypal.com/ncp/payment/SVPS6J8WXQU76' },
                    tiers: [
                        { amount: '$500+', title: 'Starter Kit', desc: 'Basic power + connectivity' },
                        { amount: '$2,000+', title: 'Community Kit', desc: 'Power + Solar + Training' }
                    ],
                    note: 'Contact us for matching gift options.'
                },
                ja: {
                    icon: '✨🎉',
                    titleMain: 'ニューイヤー寄付',
                    titleSub: 'コミュニティに新しい始まりを',
                    subtitle: 'オフグリッドの支援をはじめましょう',
                    description: '年のはじめに、農村や寺院へのインフラ支援をお願いします。',
                    cta: { text: 'PayPalで寄付', link: 'https://www.paypal.com/ncp/payment/SVPS6J8WXQU76' },
                    tiers: [
                        { amount: '¥50,000〜', title: 'スターターキット', desc: '基本の電力＋接続' },
                        { amount: '¥200,000〜', title: 'コミュニティキット', desc: '電力＋ソーラー＋研修' }
                    ],
                    note: 'マッチングギフトについてはお問い合わせください。'
                }
            }
        },
        {
            id: 'valentine',
            start: 201, // Feb 1
            end: 214,   // Feb 14
            locales: {
                en: {
                    icon: '💌',
                    titleMain: "Valentine's Support",
                    titleSub: 'Care for families and farms',
                    subtitle: 'Give with care',
                    description: 'This month we focus on small families and independent farms needing early-season support.',
                    cta: { text: 'Give Now', link: 'https://www.paypal.com/ncp/payment/SVPS6J8WXQU76' },
                    tiers: [
                        { amount: '$100+', title: 'Meal & Care', desc: 'Support essentials' },
                        { amount: '$500+', title: 'Starter Power', desc: 'Portable power + support' }
                    ],
                    note: ''
                },
                ja: {
                    icon: '💌',
                    titleMain: 'バレンタイン支援',
                    titleSub: '家族と農家に寄り添う',
                    subtitle: '思いやりを届ける',
                    description: '今月は小さな家族や農家への支援に注力します。',
                    cta: { text: '今すぐ寄付', link: 'https://www.paypal.com/ncp/payment/SVPS6J8WXQU76' },
                    tiers: [
                        { amount: '¥10,000〜', title: '食事とケア', desc: '必需品の支援' },
                        { amount: '¥50,000〜', title: 'スターターパワー', desc: '携帯電源＋サポート' }
                    ],
                    note: ''
                }
            }
        },
        {
            id: 'summer',
            start: 701, // Jul 1
            end: 831,   // Aug 31
            locales: {
                en: {
                    icon: '☀️',
                    titleMain: 'Summer Resilience',
                    titleSub: 'Keep communities powered',
                    subtitle: 'Seasonal infrastructure',
                    description: 'Support summer programs to harden local resilience and cook up community projects.',
                    cta: { text: 'Support Summer', link: 'https://www.paypal.com/ncp/payment/SVPS6J8WXQU76' },
                    tiers: [
                        { amount: '$1,000+', title: 'Mini Grid', desc: 'Local shared power' },
                        { amount: '$5,000+', title: 'Village Support', desc: 'Larger installs' }
                    ],
                    note: ''
                },
                ja: {
                    icon: '☀️',
                    titleMain: 'サマーレジリエンス',
                    titleSub: '地域を支える電力',
                    subtitle: '季節のインフラ支援',
                    description: '夏季の支援で地域の強靭化を進めます。',
                    cta: { text: 'サポートする', link: 'https://www.paypal.com/ncp/payment/SVPS6J8WXQU76' },
                    tiers: [
                        { amount: '¥100,000〜', title: 'ミニグリッド', desc: '地域共有電力' },
                        { amount: '¥500,000〜', title: '村サポート', desc: '大規模設置' }
                    ],
                    note: ''
                }
            }
        },
        {
            id: 'christmas',
            start: 1201, // Dec 1
            end: 1231,   // Dec 31
            locales: {
                en: {
                    icon: '🎄🎅',
                    titleMain: 'Christmas Giving',
                    titleSub: 'Global + Local = Strong',
                    subtitle: 'Growing with Ohana',
                    description: 'This Christmas, give the gift of independence. Your donation delivers off-grid infrastructure to farms, temples, and communities.',
                    cta: { text: '🎁 Donate via PayPal', link: 'https://www.paypal.com/ncp/payment/SVPS6J8WXQU76' },
                    tiers: [
                        { amount: '$1,000+', title: 'Portable Power', desc: 'Jackery 1000 Plus (stationary) / 290W (mobile)' },
                        { amount: '$3,000+', title: 'Connectivity Kit', desc: 'Starlink + Battery + Solar' },
                        { amount: '$5,000+', title: 'Small-Scale', desc: 'Basic farm/temple setup' }
                    ],
                    note: 'Zelle: business@satotakuya.jp'
                },
                ja: {
                    icon: '🎄🎅',
                    titleMain: 'クリスマス基金',
                    titleSub: 'グローバル＋ローカルで強く',
                    subtitle: 'Ohanaと共に成長する',
                    description: 'このクリスマス、独立の贈り物を届けましょう。寄付は農地や寺院へのインフラ支援になります。',
                    cta: { text: '🎁 PayPalで寄付', link: 'https://www.paypal.com/ncp/payment/SVPS6J8WXQU76' },
                    tiers: [
                        { amount: '¥100,000〜', title: '携帯電源', desc: 'Jackery 1000 Plus（据置）/ 290W（車載）' },
                        { amount: '¥300,000〜', title: '接続キット', desc: 'Starlink + バッテリー + ソーラー' },
                        { amount: '¥500,000〜', title: '小規模構築', desc: '農地／寺院の基本設備' }
                    ],
                    note: 'Zelle: business@satotakuya.jp'
                }
            }
        }
    ];

    const DEFAULTS = {
        en: {
            icon: '📣',
            titleMain: 'Ongoing Support',
            titleSub: '',
            subtitle: 'Support our ongoing projects',
            description: 'Help us continue delivering resilient infrastructure year-round.',
            cta: { text: 'Donate', link: 'https://www.paypal.com/ncp/payment/SVPS6J8WXQU76' },
            tiers: [],
            note: ''
        },
        ja: {
            icon: '📣',
            titleMain: '継続的な支援',
            titleSub: '',
            subtitle: '通年でプロジェクトを支援する',
            description: '通年でインフラ支援を継続するための寄付をお願いします。',
            cta: { text: '寄付する', link: 'https://www.paypal.com/ncp/payment/SVPS6J8WXQU76' },
            tiers: [],
            note: ''
        }
    };

    function mmddFromDate(d) {
        return (d.getMonth() + 1) * 100 + d.getDate();
    }

    function inRange(dateMMDD, startMMDD, endMMDD) {
        if (startMMDD <= endMMDD) {
            return dateMMDD >= startMMDD && dateMMDD <= endMMDD;
        }
        // wraps year end (e.g., Dec -> Jan)
        return dateMMDD >= startMMDD || dateMMDD <= endMMDD;
    }

    function renderTiers(container, tiers) {
        container.innerHTML = '';
        if (!tiers || tiers.length === 0) {
            container.style.display = 'none';
            return;
        }
        container.style.display = '';
        tiers.forEach(t => {
            const div = document.createElement('div');
            div.className = 'donation-tier';
            div.innerHTML = `<div class="tier-amount">${t.amount}</div><div class="tier-title">${t.title}</div><div class="tier-desc">${t.desc}</div>`;
            container.appendChild(div);
        });
    }

    function applyCampaignContent(content) {
        const iconEl = document.querySelector('.campaign-icon');
        const titleEl = document.querySelector('.campaign-title');
        const subtitleEl = document.querySelector('.campaign-subtitle');
        const descEl = document.querySelector('.campaign-description');
        const tiersEl = document.querySelector('.donation-tiers');
        const ctaEl = document.querySelector('.campaign-cta');
        const noteEl = document.querySelector('.campaign-note');
        const sectionEl = document.querySelector('#campaign');

        if (iconEl) iconEl.textContent = content.icon || '';
        if (titleEl) {
            const main = content.titleMain || '';
            const sub = content.titleSub ? `<span class="campaign-title-sub">${content.titleSub}</span>` : '';
            titleEl.innerHTML = `${main} ${sub}`.trim();
        }
        if (subtitleEl) subtitleEl.textContent = content.subtitle || '';
        if (descEl) descEl.innerHTML = (content.description || '').replace(/\n/g, '<br>');
        if (tiersEl) renderTiers(tiersEl, content.tiers);
        if (ctaEl) {
            if (content.cta && content.cta.link) {
                ctaEl.href = content.cta.link;
                ctaEl.textContent = content.cta.text || 'Donate';
                ctaEl.style.display = '';
            } else {
                ctaEl.style.display = 'none';
            }
        }
        if (noteEl) noteEl.textContent = content.note || '';
        if (sectionEl) sectionEl.dataset.activeCampaign = content.id || '';
    }

    document.addEventListener('DOMContentLoaded', function () {
        const lang = (document.documentElement.lang || 'en').toLowerCase().startsWith('ja') ? 'ja' : 'en';
        const todayMMDD = mmddFromDate(new Date());

        // Find first matching event
        const match = EVENTS.find(ev => inRange(todayMMDD, ev.start, ev.end));
        let content = null;
        if (match) {
            content = Object.assign({ id: match.id }, match.locales[lang] || match.locales.en);
        } else {
            content = Object.assign({ id: 'default' }, DEFAULTS[lang]);
        }

        // Attach id to content for debugging
        content.id = content.id || (match ? match.id : 'default');

        applyCampaignContent(content);
    });
})();
