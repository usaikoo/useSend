export function buildStorefrontTrackerScript(options: {
  trackingKey: string;
  endpoint: string;
}) {
  const trackingKey = JSON.stringify(options.trackingKey);
  const endpoint = JSON.stringify(options.endpoint);

  return `(function(){var k=${trackingKey},e=${endpoint};function g(n){var m=document.cookie.match(new RegExp("(^| )"+n+"=([^;]+)"));return m?m[2]:null}function s(n,v,d){var x=new Date(Date.now()+d*864e5).toUTCString();document.cookie=n+"="+v+"; expires="+x+"; path=/; SameSite=Lax"}function u(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(c){var r=Math.random()*16|0,v=c=="x"?r:r&3|8;return v.toString(16)})}function id(){var d={};if(window.meta&&window.meta.page&&window.meta.page.customerId){d.shopifyCustomerId=String(window.meta.page.customerId)}if(window.Shopify&&window.Shopify.checkout&&window.Shopify.checkout.email){d.email=window.Shopify.checkout.email}return d}var vid=g("_rr_vid")||u();s("_rr_vid",vid,365);var sid=g("_rr_sid")||u();s("_rr_sid",sid,0.02);function send(t,d){var p=Object.assign({key:k,eventType:t,visitorId:vid,sessionId:sid,url:location.href,path:location.pathname,referrer:document.referrer||null,occurredAt:new Date().toISOString()},id(),d||{}),b=JSON.stringify(p);if(navigator.sendBeacon){navigator.sendBeacon(e,new Blob([b],{type:"application/json"}))}else{fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:b,keepalive:true,credentials:"omit"})}}send("PAGE_VIEW");if(window.meta&&window.meta.product){send("PRODUCT_VIEW",{productId:String(window.meta.product.id),productHandle:window.meta.product.handle||null,variantId:window.meta.product.variants&&window.meta.product.variants[0]?String(window.meta.product.variants[0].id):null})}else if(window.ShopifyAnalytics&&window.ShopifyAnalytics.meta&&window.ShopifyAnalytics.meta.product){var p=window.ShopifyAnalytics.meta.product;send("PRODUCT_VIEW",{productId:String(p.id),productHandle:p.handle||null})}if(window.meta&&window.meta.collection){send("COLLECTION_VIEW",{collectionHandle:window.meta.collection.handle})}if(location.pathname.indexOf("/search")===0){var q=new URLSearchParams(location.search).get("q");if(q){send("SEARCH",{searchQuery:q})}}if(location.pathname.indexOf("/checkout")===0||location.pathname.indexOf("/checkouts")===0){send("CHECKOUT_STARTED")}if(window.Shopify&&window.Shopify.checkout){send("PURCHASE",{orderId:window.Shopify.checkout.order_id?String(window.Shopify.checkout.order_id):null,value:window.Shopify.checkout.total_price?parseFloat(window.Shopify.checkout.total_price):null,currency:window.Shopify.checkout.currency||null})}else if(window.Shopify&&window.Shopify.Checkout&&window.Shopify.Checkout.page==="thank_you"){send("PURCHASE")}var of=window.fetch;window.fetch=function(){var a=arguments[0],u=typeof a==="string"?a:a&&a.url?a.url:"",r=of.apply(this,arguments);if(u.indexOf("/cart/add")!==-1){r.then(function(res){if(res.ok){res.clone().json().then(function(item){send("ADD_TO_CART",{productId:item.product_id?String(item.product_id):null,variantId:item.variant_id?String(item.variant_id):null,quantity:item.quantity||1})}).catch(function(){})}}).catch(function(){})}return r}})();`;
}

export function buildTrackingScriptUrl(appUrl: string, trackingKey: string) {
  const base = appUrl.replace(/\/$/, "");
  return `${base}/api/track/shopify.js?key=${encodeURIComponent(trackingKey)}`;
}

export function buildTrackingScriptUrlByShop(appUrl: string, shopDomain: string) {
  const base = appUrl.replace(/\/$/, "");
  return `${base}/api/track/shopify.js?shop=${encodeURIComponent(shopDomain)}`;
}

export function buildTrackingSnippet(appUrl: string, trackingKey: string) {
  const scriptUrl = buildTrackingScriptUrl(appUrl, trackingKey);
  return `<script async src="${scriptUrl}"></script>`;
}
