// src/components/MessageTemplates.jsx
// These templates only render the *content body* — the avatar, username, timestamp,
// and message wrapper are all handled by HubChat's MessageItem.
// Keep them lean: they receive `item` and return only the message text/body.

export const CardMessageTemplate = ({ item }) => (
  <p className="text-sm leading-relaxed">{item.text}</p>
);

export const BubbleMessageTemplate = ({ item }) => (
  <p className="text-sm leading-relaxed">{item.text}</p>
);

export const MinimalMessageTemplate = ({ item }) => (
  <p className="text-sm leading-relaxed font-mono">{item.text}</p>
);

export const RichMessageTemplate = ({ item }) => (
  <p className="text-sm leading-relaxed">{item.text}</p>
);

export const messageTemplates = {
  default:  { component: undefined,                name: "Default"  },
  card:     { component: CardMessageTemplate,      name: "Card"     },
  bubble:   { component: BubbleMessageTemplate,    name: "Bubble"   },
  minimal:  { component: MinimalMessageTemplate,   name: "Minimal"  },
  rich:     { component: RichMessageTemplate,      name: "Rich"     },
};