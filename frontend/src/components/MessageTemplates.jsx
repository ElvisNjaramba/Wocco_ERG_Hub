// src/pages/MessageTemplates.jsx
import * as React from "react";

// Dummy user for alignment
const user = {
  id: 1,
  name: "Demo User",
  avatarUrl: "https://demos.telerik.com/kendo-ui/content/web/Customers/RICSU.jpg",
};

// Card Template
export const CardMessageTemplate = ({ item }) => (
  <div style={{
    border: '1px solid #dee2e6',
    borderRadius: 12,
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    margin: '12px 0',
    maxWidth: '80%',
    marginLeft: item.author.id === user.id ? 'auto' : '0',
    marginRight: item.author.id === user.id ? '0' : 'auto'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', padding: 12, borderBottom: '1px solid #f1f3f4' }}>
      <img src={item.author.avatarUrl} alt={item.author.name} style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }} />
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '0.9em' }}>{item.author.name}</div>
        <div style={{ fontSize: '0.7em', color: '#6c757d' }}>
          {item.timestamp && item.timestamp.toLocaleString()}
        </div>
      </div>
    </div>
    <div style={{ padding: 12 }}>{item.text}</div>
  </div>
);

// Bubble Template
export const BubbleMessageTemplate = ({ item }) => {
  const isUser = item.author.id === user.id;
  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      margin: '8px 0',
      gap: 8
    }}>
      <div style={{
        backgroundColor: isUser ? '#007bff' : '#e9ecef',
        color: isUser ? 'white' : 'black',
        padding: '8px 12px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        maxWidth: '60%',
        position: 'relative'
      }}>
        <div style={{ fontSize: '0.7em', opacity: 0.8, marginBottom: 2 }}>{item.author.name}</div>
        {item.text}
        <div style={{ fontSize: '0.6em', opacity: 0.7, marginTop: 2 }}>
          {item.timestamp && item.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

// Minimal Template
export const MinimalMessageTemplate = ({ item }) => (
  <div style={{
    padding: '6px 0',
    borderLeft: item.author.id === user.id ? '3px solid #007bff' : '3px solid #28a745',
    paddingLeft: 8,
    margin: '4px 0'
  }}>
    <span style={{ fontWeight: 'bold', fontSize: '0.8em' }}>{item.author.name}:</span>
    <span style={{ marginLeft: 8 }}>{item.text}</span>
    <span style={{ fontSize: '0.7em', color: '#6c757d', marginLeft: 8 }}>
      ({item.timestamp && item.timestamp.toLocaleTimeString()})
    </span>
  </div>
);

// Rich Template
export const RichMessageTemplate = ({ item }) => (
  <div style={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: 16,
    borderRadius: 16,
    margin: '12px 0',
    maxWidth: '75%',
    marginLeft: item.author.id === user.id ? 'auto' : '0',
    marginRight: item.author.id === user.id ? '0' : 'auto',
    position: 'relative',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
      <img src={item.author.avatarUrl} alt={item.author.name} style={{ width: 28, height: 28, borderRadius: '50%', marginRight: 8, border: '2px solid white' }} />
      <div>
        <div style={{ fontWeight: 'bold' }}>{item.author.name}</div>
        <div style={{ fontSize: '0.7em', opacity: 0.9 }}>
          {item.timestamp && item.timestamp.toLocaleDateString()} at {item.timestamp && item.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
    <div style={{ fontSize: '1.1em', lineHeight: 1.4 }}>{item.text}</div>
    <div style={{
      position: 'absolute',
      bottom: '-8px',
      left: item.author.id === user.id ? 'auto' : '20px',
      right: item.author.id === user.id ? '20px' : 'auto',
      width: 0,
      height: 0,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderTop: '8px solid #764ba2'
    }} />
  </div>
);

// export for HubChat
export const messageTemplates = {
  default: { component: undefined, name: "Default" },
  card: { component: CardMessageTemplate },
  bubble: { component: BubbleMessageTemplate },
  minimal: { component: MinimalMessageTemplate },
  rich: { component: RichMessageTemplate },
};
