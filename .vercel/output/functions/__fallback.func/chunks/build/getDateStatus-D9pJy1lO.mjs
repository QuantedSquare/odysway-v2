const s={soon_confirmed:{status:"soon_confirmed",text:"Bientôt confirmé",color:"yellow"},confirmed:{status:"confirmed",text:"Départ Garanti",color:"green"},guaranteed:{status:"full",text:"Complet",color:"secondary"},full:{status:"full",text:"Complet",color:"secondary"}};function e(t){return t.max_travelers===t.booked_seat?s.guaranteed:t.booked_seat>=t.min_travelers?s.confirmed:s.soon_confirmed}function o(t){return t.displayed_status&&s[t.displayed_status]?s[t.displayed_status]:t.status&&s[t.status]?s[t.status]:e(t)}

export { o };
//# sourceMappingURL=getDateStatus-D9pJy1lO.mjs.map
